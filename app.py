from flask import Flask, jsonify, request
from concurrent.futures import ThreadPoolExecutor, as_completed
from email.message import EmailMessage
from email.utils import parseaddr
import os
import random
import sqlite3
import smtplib
import ssl
import time
import uuid
from datetime import datetime, timedelta, timezone as dt_timezone
from zoneinfo import ZoneInfo

import requests
from dotenv import load_dotenv
from timezonefinder import TimezoneFinder
from yogi_calculations import calculate_yogi_points

app = Flask(__name__, static_folder='public', static_url_path='')
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'jyotishx.db')
load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(BASE_DIR, '.env.geoapify'))
PORT = int(os.getenv('PORT', '5000'))


def load_backend_env():
    env_path = os.path.join(BASE_DIR, '.env')
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r', encoding='utf-8') as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = [part.strip() for part in line.split('=', 1)]
            if key and not os.getenv(key):
                os.environ[key] = value.strip('"\'')


load_backend_env()

_timezone_finder = None


def get_timezone_finder():
    global _timezone_finder
    if _timezone_finder is None:
        _timezone_finder = TimezoneFinder()
    return _timezone_finder


def geoapify_geocode(query, mode='search', limit=1):
    api_key = (os.getenv('GEOAPIFY_API_KEY') or '').strip()
    if not api_key:
        return None

    endpoint = 'autocomplete' if mode == 'autocomplete' else 'search'
    response = requests.get(
        f'https://api.geoapify.com/v1/geocode/{endpoint}',
        params={'text': query, 'format': 'json', 'limit': limit, 'apiKey': api_key},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    results = data.get('results') if isinstance(data, dict) else []
    return results if isinstance(results, list) else []


def serialize_geoapify_candidate(item, fallback_query=''):
    timezone = item.get('timezone') if isinstance(item.get('timezone'), dict) else {}
    rank = item.get('rank') if isinstance(item.get('rank'), dict) else {}
    return {
        'place': item.get('formatted') or item.get('address_line1') or fallback_query,
        'latitude': item.get('lat'),
        'longitude': item.get('lon'),
        'city': item.get('city') or item.get('town') or item.get('village'),
        'state': item.get('state'),
        'country': item.get('country'),
        'timezoneId': timezone.get('name'),
        'confidence': rank.get('confidence'),
        'confidenceCityLevel': rank.get('confidence_city_level'),
        'matchType': rank.get('match_type'),
    }

COMBUSTION_LIMITS = {
    'sun': (None, None),
    'moon': (12, None),
    'mars': (17, 17),
    'mercury': (14, 12),
    'jupiter': (11, 11),
    'venus': (10, 8),
    'saturn': (15, 15),
    'rahu': (None, None),
    'ketu': (None, None),
}


def calculate_combust_planets(planets, longitudes):
    sun_longitude = longitudes.get('Sun')
    if sun_longitude is None:
        sun_data = planets.get('Sun') if isinstance(planets, dict) else None
        sun_longitude = sun_data.get('fullDegree') if isinstance(sun_data, dict) else None
    try:
        sun_longitude = float(sun_longitude) % 360
    except (TypeError, ValueError):
        return set()
    if sun_longitude != sun_longitude:
        return set()

    combust_planets = set()
    for planet_name, (direct_limit, retrograde_limit) in COMBUSTION_LIMITS.items():
        limit = direct_limit
        if limit is None:
            continue
        planet_data = planets.get(planet_name.title()) if isinstance(planets, dict) else None
        if not isinstance(planet_data, dict):
            continue
        is_retrograde = str(planet_data.get('isRetro', '')).strip().lower() in {'true', '1', 'yes'}
        if is_retrograde:
            limit = retrograde_limit
        if limit is None:
            continue

        longitude = longitudes.get(planet_name.title())
        if longitude is None:
            longitude = planet_data.get('fullDegree')
        try:
            longitude = float(longitude) % 360
        except (TypeError, ValueError):
            continue
        if longitude != longitude:
            continue

        angular_separation = abs((sun_longitude - longitude + 180) % 360 - 180)
        if angular_separation <= limit:
            combust_planets.add(planet_name)

    return combust_planets


def post_json_with_retry(url, payload, api_key, retries=3, timeout=30):
    headers = {'x-api-key': api_key, 'Content-Type': 'application/json'}
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=(10, timeout),
            )
            if response.status_code in (429, 500, 502, 503, 504):
                raise requests.exceptions.HTTPError(f'HTTP {response.status_code}')
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            last_error = exc
            if attempt == retries:
                break
            time.sleep(0.8 * attempt)

    raise last_error


horoscopes = {
    'aries': [
        'A fresh opportunity is near — act boldly.',
        'You’ll find energy for a creative project today.'
    ],
    'taurus': [
        'Comfort and routine bring unexpected joy.',
        'A stable choice now pays off later.'
    ],
    'gemini': [
        'Curiosity opens a useful conversation.',
        'Divide your time wisely — play and work both benefit.'
    ],
    'cancer': [
        'Home and feelings take center stage.',
        'A small kindness heals a lingering worry.'
    ],
    'leo': [
        'Your confidence attracts a helpful ally.',
        'Show your light — others will follow.'
    ],
    'virgo': [
        'Attention to detail solves a mystery.',
        'Organize one small area and feel lighter.'
    ],
    'libra': [
        'Seek balance; a conversation can restore harmony.',
        'A social connection brings pleasant news.'
    ],
    'scorpio': [
        'Depth reveals a meaningful insight.',
        'Trust your instincts in a private matter.'
    ],
    'sagittarius': [
        'A short journey or new idea lifts your spirits.',
        'Learn something wild and useful today.'
    ],
    'capricorn': [
        'Consistent work builds momentum; keep going.',
        'Your steady approach wins respect.'
    ],
    'aquarius': [
        'Innovation solves a stubborn problem.',
        'Share a quirky idea — it will land well.'
    ],
    'pisces': [
        'Imagination guides a productive rest.',
        'A dreamlike insight points to practical steps.'
    ]
}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                dob TEXT,
                phone TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            '''
        )
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT NOT NULL,
                code TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL
            )
            '''
        )
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL
            )
            '''
        )
        conn.commit()


def generate_otp():
    return str(random.randint(100000, 999999))


def store_otp(phone, code):
    expires_at = (datetime.utcnow() + timedelta(minutes=5)).strftime('%Y-%m-%dT%H:%M:%S')
    with get_db() as conn:
        conn.execute('DELETE FROM otps WHERE phone = ?', (phone,))
        conn.execute(
            'INSERT INTO otps (phone, code, created_at, expires_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
            (phone, code, expires_at),
        )
        conn.commit()
    return code


def validate_otp(phone, code):
    with get_db() as conn:
        row = conn.execute(
            'SELECT * FROM otps WHERE phone = ? ORDER BY id DESC LIMIT 1',
            (phone,),
        ).fetchone()
        if row is None:
            return False
        expires_at = datetime.strptime(row['expires_at'], '%Y-%m-%dT%H:%M:%S')
        if datetime.utcnow() > expires_at:
            return False
        return row['code'] == str(code)


def create_session(user_id):
    token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%S')
    with get_db() as conn:
        conn.execute(
            'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
            (token, user_id, expires_at),
        )
        conn.commit()
    return token


def get_user_from_token(token):
    if not token:
        return None
    with get_db() as conn:
        row = conn.execute(
            '''
            SELECT u.*
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > ?
            ''',
            (token, datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S')),
        ).fetchone()
    if row is None:
        return None
    return dict(row)


def resolve_place_to_coordinates(place_name):
    if not place_name:
        raise ValueError('Place name is required')

    geoapify_key = (os.getenv('GEOAPIFY_API_KEY') or '').strip()
    if geoapify_key:
        results = geoapify_geocode(place_name, limit=1) or []
        if results:
            first = results[0]
            latitude = first.get('lat')
            longitude = first.get('lon')
            if latitude is not None and longitude is not None:
                return float(latitude), float(longitude), first.get('formatted') or place_name
        raise ValueError('Geoapify could not find that birthplace. Please refine the place name.')

    api_key = (os.getenv('GOOGLE_MAPS_API_KEY') or os.getenv('GOOGLE_API_KEY') or '').strip()
    if api_key:
        response = requests.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            params={'address': place_name, 'key': api_key},
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        status = (data or {}).get('status')
        if status == 'OK':
            results = (data or {}).get('results') or []
            if results:
                location = results[0].get('geometry', {}).get('location', {})
                lat = location.get('lat')
                lng = location.get('lng')
                if lat is not None and lng is not None:
                    return float(lat), float(lng), results[0].get('formatted_address')
        else:
            # Fall back to a free geocoder when Google is missing or rejected the key.
            pass

    nominatim_response = requests.get(
        'https://nominatim.openstreetmap.org/search',
        params={'q': place_name, 'format': 'jsonv2', 'limit': 1},
        headers={'User-Agent': 'JyotishLab/1.0'},
        timeout=20,
    )
    nominatim_response.raise_for_status()
    data = nominatim_response.json()
    if not data:
        raise ValueError('No matching place found for the provided location name.')

    first = data[0]
    lat = first.get('lat')
    lon = first.get('lon')
    if lat is None or lon is None:
        raise ValueError('Place found, but coordinates were not returned by the lookup service.')

    return float(lat), float(lon), first.get('display_name') or place_name


def resolve_birthplace_details(place_name, birth_date, birth_time, confirm_place=False):
    try:
        date_obj = datetime.strptime(birth_date, '%Y-%m-%d').date()
        time_obj = datetime.strptime(birth_time, '%H:%M').time()
    except ValueError as exc:
        raise ValueError('Birth date or time is invalid.') from exc

    geoapify_results = geoapify_geocode(place_name, mode='search', limit=5)
    candidates = []
    if geoapify_results:
        candidates = [
            serialize_geoapify_candidate(item, place_name)
            for item in geoapify_results
            if isinstance(item, dict) and item.get('lat') is not None and item.get('lon') is not None
        ]
        if not candidates:
            raise ValueError('Geoapify could not find that birthplace. Please refine the place name.')

        best = candidates[0]
        best_confidence = float(best.get('confidence') or 0)
        best_city_confidence = float(best.get('confidenceCityLevel') or 0)
        best_identity = tuple(str(best.get(key) or '').strip().casefold() for key in ('city', 'state', 'country'))
        equally_ranked_identities = {
            tuple(str(candidate.get(key) or '').strip().casefold() for key in ('city', 'state', 'country'))
            for candidate in candidates
            if float(candidate.get('confidence') or 0) >= best_confidence - 0.05
        }
        confident_match = (
            best.get('matchType') == 'full_match'
            and best_confidence >= 0.85
            and best_city_confidence >= 0.85
            and len(equally_ranked_identities - {('', '', '')}) == 1
            and best_identity != ('', '', '')
        )
        if not confirm_place and not confident_match:
            return {
                'selection_required': True,
                'candidates': candidates,
            }

        normalized_query = place_name.strip().casefold()
        selected = next(
            (candidate for candidate in candidates if candidate['place'].strip().casefold() == normalized_query),
            best,
        )
        latitude = float(selected['latitude'])
        longitude = float(selected['longitude'])
        resolved_place = selected['place']
        timezone_name = selected.get('timezoneId')
        city = selected.get('city')
        state = selected.get('state')
        country = selected.get('country')
    else:
        latitude, longitude, resolved_place = resolve_place_to_coordinates(place_name)
        timezone_name = None
        city = state = country = None

    timezone_name = timezone_name or get_timezone_finder().timezone_at(lng=longitude, lat=latitude)
    if not timezone_name:
        raise ValueError('Could not determine the timezone for that birthplace. Please refine the place name.')

    try:
        local_naive = datetime.combine(date_obj, time_obj)
        timezone_info = ZoneInfo(timezone_name)
        local_birth_time = local_naive.replace(tzinfo=timezone_info)
        utc_offset = local_birth_time.utcoffset()
        dst_offset = local_birth_time.dst() or timedelta(0)
        utc_birth_time = local_birth_time.astimezone(dt_timezone.utc)
    except Exception as exc:
        raise RuntimeError('Could not calculate the local timezone for that birth date.') from exc
    if utc_offset is None:
        raise RuntimeError('Could not calculate the local timezone for that birth date.')
    if utc_birth_time.astimezone(timezone_info).replace(tzinfo=None) != local_naive:
        raise ValueError('That local birth time does not exist because of a daylight-saving clock change.')

    utc_offset_minutes = int(round(utc_offset.total_seconds() / 60))
    dst_offset_minutes = int(round(dst_offset.total_seconds() / 60))
    birth_place = resolved_place or place_name
    city = city or birth_place
    utc_birth_time_text = utc_birth_time.isoformat().replace('+00:00', 'Z')

    return {
        'place': birth_place,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': round(utc_offset.total_seconds() / 3600, 6),
        'timezone_name': timezone_name,
        'birthDate': date_obj.isoformat(),
        'birthTime': time_obj.strftime('%H:%M'),
        'birthPlace': birth_place,
        'city': city,
        'state': state,
        'country': country,
        'timezoneId': timezone_name,
        'utcOffsetMinutes': utc_offset_minutes,
        'dstOffsetMinutes': dst_offset_minutes,
        'utcBirthTime': utc_birth_time_text,
    }


@app.route('/api/place-autocomplete', methods=['GET'])
def place_autocomplete_api():
    query = (request.args.get('text') or '').strip()
    if len(query) < 3:
        return jsonify({'success': True, 'results': []})

    if not (os.getenv('GEOAPIFY_API_KEY') or '').strip():
        return jsonify({'success': False, 'error': 'Geoapify is not configured on the server.'}), 500

    try:
        provider_results = geoapify_geocode(query, mode='autocomplete', limit=6) or []
        results = [
            serialize_geoapify_candidate(item, query)
            for item in provider_results
            if isinstance(item, dict) and item.get('lat') is not None and item.get('lon') is not None
        ]
        return jsonify({'success': True, 'results': results})
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Geoapify autocomplete failed: {str(exc)}'}), 502
    except ValueError:
        return jsonify({'success': False, 'error': 'Geoapify returned an invalid response.'}), 502


@app.route('/api/resolve-place', methods=['POST'])
def resolve_birthplace_api():
    payload = request.get_json(silent=True) or {}
    place_name = (payload.get('place') or '').strip()
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or '').strip()
    confirm_place = payload.get('confirm_place') is True
    if not place_name or not dob or not tob:
        return jsonify({'success': False, 'error': 'Place, birth date, and birth time are required.'}), 400

    try:
        details = resolve_birthplace_details(place_name, dob, tob, confirm_place=confirm_place)
        return jsonify({'success': True, **details})
    except ValueError as exc:
        return jsonify({'success': False, 'error': str(exc)}), 400
    except (RuntimeError, requests.RequestException) as exc:
        return jsonify({'success': False, 'error': str(exc)}), 502


@app.route('/api/horoscope')
def horoscope_api():
    zodiac = request.args.get('zodiac', 'aries').lower()
    choices = horoscopes.get(zodiac, horoscopes['aries'])
    text = random.choice(choices)
    return jsonify({'zodiac': zodiac, 'text': text})


@app.route('/api/chart', methods=['POST'])
def chart_api():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or payload.get('time') or '').strip()
    lat = (payload.get('lat') or '').strip()
    lon = (payload.get('lon') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or payload.get('city') or payload.get('location') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        os.getenv('FREE_ASTRO_API_KEY') or
        os.getenv('FREEASTRO_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({
            'success': False,
            'error': 'No API key is configured. Set NAVAMSHA_API_KEY or VDA_API_KEY in the backend environment.'
        }), 500

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        if isinstance(value, str):
            value = value.strip()
            if ':' in value:
                try:
                    sign = 1
                    raw = value
                    if raw.startswith('-'):
                        sign = -1
                        raw = raw[1:]
                    elif raw.startswith('+'):
                        raw = raw[1:]
                    hours_str, minutes_str = raw.split(':', 1)
                    hours = int(hours_str)
                    minutes = int(minutes_str)
                    return sign * (hours + minutes / 60)
                except (TypeError, ValueError):
                    return 5.5
            try:
                return float(value)
            except ValueError:
                return 5.5
        try:
            return float(value)
        except (TypeError, ValueError):
            return 5.5

    latitude = 28.6139
    longitude = 77.2090
    resolved_place = None

    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except ValueError:
            pass
    elif place_name:
        try:
            latitude, longitude, resolved_place = resolve_place_to_coordinates(place_name)
        except ValueError as exc:
            return jsonify({'success': False, 'error': str(exc)}), 400
        except RuntimeError as exc:
            return jsonify({'success': False, 'error': str(exc)}), 500

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {}
    }

    try:
        response = post_json_with_retry(
            'https://api.navamsha.in/api/v1/astrology/birth-details',
            request_payload,
            api_key,
            retries=3,
            timeout=30,
        )
        if response.status_code == 401:
            return jsonify({'success': False, 'error': 'Navamsha API rejected the API key'}), 401
        data = response.json()

        output = data.get('output') if isinstance(data, dict) else None
        if not isinstance(output, dict):
            output = data

        panchang_response = post_json_with_retry(
            'https://api.navamsha.in/api/v1/astrology/panchang',
            request_payload,
            api_key,
            retries=3,
            timeout=30,
        )
        panchang_data = panchang_response.json()
        panchang_output = panchang_data.get('output') if isinstance(panchang_data, dict) else {}

        tithi_list = panchang_output.get('tithi') if isinstance(panchang_output, dict) else []
        karana_list = panchang_output.get('karana') if isinstance(panchang_output, dict) else []
        yoga_list = panchang_output.get('yoga') if isinstance(panchang_output, dict) else []

        nakshatra = output.get('nakshatra') if isinstance(output, dict) else {}
        chandra = output.get('chandra_rasi') if isinstance(output, dict) else {}
        soorya = output.get('soorya_rasi') if isinstance(output, dict) else {}
        zodiac = output.get('zodiac') if isinstance(output, dict) else {}
        lagna = nakshatra.get('name') if isinstance(nakshatra, dict) else None

        # Format panchang summary: extract simple names and time-only sunrise/sunset
        def as_time_only(iso_dt):
            if not iso_dt:
                return None
            try:
                # support ISO with offset
                dt = datetime.fromisoformat(iso_dt)
                return dt.time().strftime('%H:%M:%S')
            except Exception:
                return iso_dt

        panchang_summary = {
            'day': date_obj.strftime('%A'),
            'tithi': (tithi_list[0].get('name') if isinstance(tithi_list, list) and tithi_list else None),
            'paksha': (tithi_list[0].get('paksha') if isinstance(tithi_list, list) and tithi_list else None),
            'karana': (karana_list[0].get('name') if isinstance(karana_list, list) and karana_list else None),
            'yoga': (yoga_list[0].get('name') if isinstance(yoga_list, list) and yoga_list else None),
            'sunrise': as_time_only(panchang_output.get('sunrise')) if isinstance(panchang_output, dict) else None,
            'sunset': as_time_only(panchang_output.get('sunset')) if isinstance(panchang_output, dict) else None,
        }

        # Try to fetch ascendant details from Navamsha chart endpoint
        ascendant_summary = None
        chart_structure = None
        try:
            chart_response = post_json_with_retry(
                'https://api.navamsha.in/api/v1/astrology/chart',
                request_payload,
                api_key,
                retries=3,
                timeout=30,
            )
            chart_data = chart_response.json()
            chart_output = chart_data.get('output') if isinstance(chart_data, dict) else chart_data
            chart_obj = chart_output.get('chart') if isinstance(chart_output, dict) else {}
            if isinstance(chart_obj, dict) and isinstance(chart_obj.get('houses'), dict):
                chart_structure = chart_obj
            asc = chart_obj.get('ascendant') if isinstance(chart_obj, dict) else None
            if isinstance(asc, dict):
                ascendant_summary = {
                    'sign': asc.get('zodiac_sign_name') or asc.get('zodiac_sign') or asc.get('zodiac') or None,
                    'full_degree': asc.get('fullDegree') or asc.get('full_degree') or None,
                    'degree_in_sign': asc.get('normDegree') or asc.get('norm_degree') or asc.get('degrees') or None,
                    'dms': {
                        'degrees': asc.get('degrees'),
                        'minutes': asc.get('minutes'),
                        'seconds': asc.get('seconds')
                    },
                    'nakshatra': asc.get('nakshatra_name') or asc.get('nakshatra') or None,
                    'nakshatra_pada': asc.get('nakshatra_pada') or asc.get('nakshatra_number') or None
                }
        except Exception:
            ascendant_summary = None

        # Compute age as Years, Months, Days from dob
        def compute_age_ymd(birth_date):
            today = datetime.now().date()
            y = today.year - birth_date.year
            m = today.month - birth_date.month
            d = today.day - birth_date.day
            if d < 0:
                # borrow days from previous month
                prev_month = (today.month - 1) or 12
                prev_year = today.year if today.month > 1 else today.year - 1
                # days in previous month
                first_of_month = datetime(prev_year, prev_month, 1).date()
                if prev_month == 12:
                    next_month_first = datetime(prev_year + 1, 1, 1).date()
                else:
                    next_month_first = datetime(prev_year, prev_month + 1, 1).date()
                days_in_prev = (next_month_first - first_of_month).days
                d += days_in_prev
                m -= 1
            if m < 0:
                m += 12
                y -= 1
            return y, m, d

        age_ymd = None
        try:
            years, months, days = compute_age_ymd(date_obj.date())
            age_ymd = f"{years}Y {months:02d}M {days:02d}D"
        except Exception:
            age_ymd = None

        # Extract ayanamsha hint from calculation_basis if present
        ayana = None
        try:
            calc_basis = output.get('additional_info', {}).get('calculation_basis', '') if isinstance(output, dict) else ''
            import re
            m = re.search(r'with\s+([^,;\n]+?)\s+ayanam?sha', calc_basis, re.IGNORECASE)
            if m:
                ayana = m.group(1).strip()
            else:
                # fallback: look for common name like Lahiri
                if 'lahiri' in calc_basis.lower():
                    ayana = 'Lahiri'
        except Exception:
            ayana = None

        # Try to locate a numeric ayanamsa value in any provider response
        def parse_degree_string(val):
            try:
                if isinstance(val, (int, float)):
                    return float(val)
                if not isinstance(val, str):
                    return None
                s = val.strip()
                # try direct float
                try:
                    return float(s)
                except Exception:
                    pass
                # DMS like 23°51'06" or 23 51 6
                import re
                m = re.search(r"(\d{1,2})[^\d]+(\d{1,2})[^\d]+(\d{1,2}(?:\.\d+)?)", s)
                if m:
                    deg = float(m.group(1)) + float(m.group(2)) / 60.0 + float(m.group(3)) / 3600.0
                    return deg
                # fallback: first floating number
                m2 = re.search(r"[-+]?[0-9]*\.?[0-9]+", s)
                if m2:
                    return float(m2.group(0))
            except Exception:
                return None
            return None

        def find_ayanamsha_value(x):
            try:
                if isinstance(x, dict):
                    for k, v in x.items():
                        if 'ayan' in k.lower():
                            val = parse_degree_string(v)
                            if val is not None:
                                return val
                        res = find_ayanamsha_value(v)
                        if res is not None:
                            return res
                elif isinstance(x, list):
                    for item in x:
                        res = find_ayanamsha_value(item)
                        if res is not None:
                            return res
            except Exception:
                return None
            return None

        ayana_value = None
        try:
            # search birth-details output, panchang and chart responses if present
            ayana_value = find_ayanamsha_value(data) or find_ayanamsha_value(panchang_data) or None
        except Exception:
            ayana_value = None

        # Ensure ascendant is also available inside the chart output object
        try:
            if ascendant_summary and isinstance(output, dict):
                output['ascendant'] = ascendant_summary
        except Exception:
            pass

        # Attach computed age and ayanamsha display string into the chart output for frontend compatibility
        try:
            if isinstance(output, dict):
                if age_ymd is not None:
                    output['age'] = age_ymd
                # Format ayanamsha string for quick display
                ayan_display = None
                if ayana:
                    ayan_display = ayana
                if ayana_value is not None:
                    # show degrees with two decimals
                    try:
                        ayan_display = f"{ayan_display or ''} ({ayana_value:.4f}°)".strip()
                    except Exception:
                        ayan_display = ayan_display
                if ayan_display is not None:
                    output['ayanamsha'] = ayan_display

        except Exception:
            pass

        return jsonify({
            'success': True,
            'chart': output,
            'chart_structure': chart_structure,
            'ascendant': ascendant_summary,
            'panchang': panchang_summary,
            'lagna': lagna,
            'age': age_ymd,
            'ayanamsha': {
                'name': ayana,
                'value': ayana_value
            },
            'subject': {
                'nakshatra': nakshatra.get('name') if isinstance(nakshatra, dict) else None,
                'nakshatra_pada': nakshatra.get('pada') if isinstance(nakshatra, dict) else None,
                'chandra_rasi': chandra.get('name') if isinstance(chandra, dict) else None,
                'soorya_rasi': soorya.get('name') if isinstance(soorya, dict) else None,
            }
        })
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Chart API request failed: {str(exc)}'}), 502


@app.route('/api/daily-panchang', methods=['GET', 'POST'])
def daily_panchang_api():
    payload = request.get_json(silent=True) or {}
    place_name = (payload.get('place') or 'Kolkata, West Bengal, India').strip()
    local_now = datetime.now(ZoneInfo('Asia/Kolkata'))
    date_text = (payload.get('date') or local_now.date().isoformat()).strip()
    time_text = (payload.get('time') or '12:00').strip()

    try:
        date_obj = datetime.strptime(date_text, '%Y-%m-%d').date()
        time_obj = datetime.strptime(time_text, '%H:%M').time()
        place_details = resolve_birthplace_details(
            place_name,
            date_text,
            time_text,
            confirm_place=payload.get('confirm_place') is True,
        )
    except ValueError as exc:
        return jsonify({'success': False, 'error': str(exc)}), 400
    except (RuntimeError, requests.RequestException) as exc:
        return jsonify({'success': False, 'error': str(exc)}), 502

    if place_details.get('selection_required'):
        return jsonify({
            'success': False,
            'selection_required': True,
            'error': 'Choose a matching location from the suggestions to continue.',
            'candidates': place_details.get('candidates', []),
        }), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        os.getenv('FREE_ASTRO_API_KEY') or
        os.getenv('FREEASTRO_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({'success': False, 'error': 'No Navamsha API key is configured.'}), 500

    location = {
        'name': place_details.get('place') or place_name,
        'latitude': place_details['latitude'],
        'longitude': place_details['longitude'],
        'timezone': place_details['timezone'],
        'timezoneId': place_details['timezoneId'],
        'utcOffsetMinutes': place_details['utcOffsetMinutes'],
        'referenceTime': time_obj.strftime('%H:%M'),
    }
    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': location['latitude'],
        'longitude': location['longitude'],
        'timezone': location['timezone'],
        'settings': {},
    }
    endpoints = (
        ('tithi', 'Tithi'),
        ('nakshatra', 'Nakshatra'),
        ('yoga', 'Yoga'),
        ('karana', 'Karana'),
        ('vara', 'Vara'),
        ('sun-times', 'Sun Times'),
        ('moon-times', 'Moon Times'),
        ('inauspicious-periods', 'Inauspicious Periods'),
        ('choghadiya', 'Choghadiya'),
        ('abhijit-muhurat', 'Abhijit Muhurat'),
        ('brahma-muhurta', 'Brahma Muhurta'),
        ('amrit-kaal', 'Amrit Kaal'),
        ('tara-bala', 'Tara Bala'),
        ('disha-shool', 'Disha Shool'),
        ('ritu', 'Ritu'),
    )

    def fetch_endpoint(endpoint):
        try:
            response = post_json_with_retry(
                f'https://api.navamsha.in/api/v1/panchang/{endpoint}',
                request_payload,
                api_key,
                retries=2,
                timeout=45,
            )
            payload = response.json()
            output = payload.get('output', payload) if isinstance(payload, dict) else payload
            return endpoint, {'success': True, 'data': output}
        except (requests.RequestException, ValueError) as exc:
            return endpoint, {'success': False, 'error': str(exc)}

    results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_endpoint, endpoint) for endpoint, _ in endpoints]
        for future in as_completed(futures):
            endpoint, result = future.result()
            results[endpoint] = result

    success = any(result.get('success') for result in results.values())
    return jsonify({
        'success': success,
        'date': date_obj.isoformat(),
        'location': location,
        'results': results,
    }), (200 if success else 502)


@app.route('/api/consultation', methods=['POST'])
def consultation_api():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get('name') or '').strip()
    email_address = str(payload.get('email') or '').strip()
    phone = str(payload.get('phone') or '').strip()
    consultation_type = str(payload.get('type') or '').strip()
    message_text = str(payload.get('message') or '').strip()

    allowed_types = {
        'General Guidance', 'Career', 'Love & Marriage', 'Health', 'Business'
    }
    parsed_email = parseaddr(email_address)[1]
    if not name or not phone or not email_address or parsed_email != email_address or '@' not in email_address:
        return jsonify({'success': False, 'error': 'Enter your name, a valid email address, and phone number.'}), 400
    if consultation_type not in allowed_types:
        return jsonify({'success': False, 'error': 'Select a valid consultation type.'}), 400
    if len(name) > 200 or len(email_address) > 320 or len(phone) > 80 or len(message_text) > 5000:
        return jsonify({'success': False, 'error': 'One or more fields exceed the allowed length.'}), 400

    smtp_host = (os.getenv('SMTP_HOST') or 'smtp.gmail.com').strip()
    smtp_username = (os.getenv('SMTP_USERNAME') or 'runmyastro@gmail.com').strip()
    smtp_password = (os.getenv('SMTP_PASSWORD') or '').replace(' ', '').strip()
    smtp_from = (os.getenv('SMTP_FROM_EMAIL') or smtp_username).strip()
    try:
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
    except ValueError:
        return jsonify({'success': False, 'error': 'Email delivery is not configured correctly.'}), 503

    if not all((smtp_host, smtp_username, smtp_from)) or not smtp_password:
        return jsonify({
            'success': False,
            'error': 'Consultation email is not configured yet. Please try again later.'
        }), 503

    email_message = EmailMessage()
    email_message['Subject'] = f'Consultation request: {consultation_type}'
    email_message['From'] = smtp_from
    email_message['To'] = 'runmyastro@gmail.com'
    email_message['Reply-To'] = email_address
    email_message.set_content(
        'A new JyotishLab consultation request was submitted.\n\n'
        f'Name: {name}\n'
        f'Email: {email_address}\n'
        f'Phone: {phone}\n'
        f'Consultation type: {consultation_type}\n\n'
        f'Details:\n{message_text or "No additional details provided."}\n'
    )

    try:
        context = ssl.create_default_context()
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20, context=context) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(email_message)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(smtp_username, smtp_password)
                server.send_message(email_message)
    except (OSError, smtplib.SMTPException):
        app.logger.exception('Consultation email delivery failed')
        return jsonify({
            'success': False,
            'error': 'We could not send your request right now. Please try again later.'
        }), 502

    return jsonify({'success': True, 'message': 'Your consultation request was sent successfully.'})


@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    payload = request.get_json(silent=True) or {}
    phone = (payload.get('phone') or '').strip()
    if not phone:
        return jsonify({'success': False, 'error': 'Phone number is required'}), 400

    code = generate_otp()
    store_otp(phone, code)
    return jsonify({
        'success': True,
        'message': 'OTP sent successfully',
        'otp': code
    })


@app.route('/api/v1/kundali/basic', methods=['POST'])
def kundali_basic():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or '').strip()
    lat = (payload.get('lat') or payload.get('latitude') or '').strip()
    lon = (payload.get('lon') or payload.get('longitude') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or payload.get('city') or payload.get('location') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        os.getenv('FREE_ASTRO_API_KEY') or
        os.getenv('FREEASTRO_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({
            'success': False,
            'error': 'No API key is configured. Set NAVAMSHA_API_KEY or VDA_API_KEY in the backend environment.'
        }), 500

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        if isinstance(value, str):
            value = value.strip()
            if ':' in value:
                try:
                    sign = 1
                    raw = value
                    if raw.startswith('-'):
                        sign = -1
                        raw = raw[1:]
                    elif raw.startswith('+'):
                        raw = raw[1:]
                    hours_str, minutes_str = raw.split(':', 1)
                    hours = int(hours_str)
                    minutes = int(minutes_str)
                    return sign * (hours + minutes / 60)
                except (TypeError, ValueError):
                    return 5.5
            try:
                return float(value)
            except ValueError:
                return 5.5
        try:
            return float(value)
        except (TypeError, ValueError):
            return 5.5

    latitude = 28.6139
    longitude = 77.2090
    resolved_place = None

    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except ValueError:
            pass
    elif place_name:
        try:
            latitude, longitude, resolved_place = resolve_place_to_coordinates(place_name)
        except ValueError as exc:
            return jsonify({'success': False, 'error': str(exc)}), 400
        except RuntimeError as exc:
            return jsonify({'success': False, 'error': str(exc)}), 500

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {}
    }

    try:
        response = requests.post(
            'https://api.navamsha.in/api/v1/astrology/chart',
            json=request_payload,
            headers={'x-api-key': api_key, 'Content-Type': 'application/json'},
            timeout=30,
        )
        if response.status_code == 401:
            return jsonify({'success': False, 'error': 'Navamsha API rejected the API key'}), 401
        response.raise_for_status()
        data = response.json()

        output = data.get('output') if isinstance(data, dict) else None
        if not isinstance(output, dict):
            return jsonify({'success': False, 'error': 'Unexpected chart response format'}), 502

        chart = output.get('chart') if isinstance(output, dict) else {}
        asc = chart.get('ascendant') if isinstance(chart, dict) else None
        if not asc:
            return jsonify({'success': False, 'error': 'Ascendant data not present in provider response'}), 502

        asc_result = {
            'sign': asc.get('zodiac_sign_name') or asc.get('zodiac_sign') or None,
            'full_degree': asc.get('fullDegree') or asc.get('full_degree') or None,
            'degree_in_sign': asc.get('normDegree') or asc.get('norm_degree') or asc.get('degrees') or None,
            'dms': {
                'degrees': asc.get('degrees'),
                'minutes': asc.get('minutes'),
                'seconds': asc.get('seconds')
            },
            'nakshatra': asc.get('nakshatra_name') or asc.get('nakshatra') or None,
            'nakshatra_pada': asc.get('nakshatra_pada') or asc.get('nakshatra_number') or None
        }

        return jsonify({'success': True, 'ascendant': asc_result, 'resolved_place': resolved_place})
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Chart API request failed: {str(exc)}'}), 502


def find_string_with_svg(x):
    try:
        if isinstance(x, str):
            if '<svg' in x:
                return x
            return None
        if isinstance(x, dict):
            for k, v in x.items():
                res = find_string_with_svg(v)
                if res:
                    return res
        if isinstance(x, list):
            for item in x:
                res = find_string_with_svg(item)
                if res:
                    return res
    except Exception:
        return None
    return None


@app.route('/api/planets', methods=['POST'])
@app.route('/api/v1/planets', methods=['POST'])
def planets_api():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or payload.get('time') or '').strip()
    lat = (payload.get('lat') or '').strip()
    lon = (payload.get('lon') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({'success': False, 'error': 'No API key configured'}), 500

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        try:
            return float(value)
        except Exception:
            return 5.5

    latitude = 28.6139
    longitude = 77.2090
    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except Exception:
            pass
    elif place_name:
        try:
            latitude, longitude, _ = resolve_place_to_coordinates(place_name)
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {}
    }

    try:
        resp = requests.post(
            'https://api.navamsha.in/api/v1/planets',
            json=request_payload,
            headers={'x-api-key': api_key, 'Content-Type': 'application/json'},
            timeout=30,
        )
        if resp.status_code == 401:
            return jsonify({'success': False, 'error': 'Navamsha API rejected the API key'}), 401
        resp.raise_for_status()
        j = resp.json()
        output = j.get('output') if isinstance(j, dict) else {}
        if not isinstance(output, dict):
            return jsonify({'success': False, 'error': 'Unexpected planets response format'}), 502

        karaka_by_planet = {}
        try:
            karaka_response = requests.post(
                'https://api.navamsha.in/api/v1/jaimini/karakas',
                json=request_payload,
                headers={'x-api-key': api_key, 'Content-Type': 'application/json'},
                timeout=30,
            )
            karaka_response.raise_for_status()
            karaka_body = karaka_response.json()
            karaka_output = karaka_body.get('output', {}) if isinstance(karaka_body, dict) else {}
            karaka_roles = karaka_output.get('karakas', {}) if isinstance(karaka_output, dict) else {}
            if isinstance(karaka_roles, dict):
                for role, details in karaka_roles.items():
                    if isinstance(details, dict) and details.get('planet'):
                        karaka_by_planet[str(details['planet']).strip().casefold()] = role
        except (requests.RequestException, ValueError) as exc:
            app.logger.warning('Unable to load Jaimini Karakas: %s', exc)

        classical_planet_names = {
            'sun': 'Sun', 'moon': 'Moon', 'mars': 'Mars', 'mercury': 'Mercury',
            'jupiter': 'Jupiter', 'venus': 'Venus', 'saturn': 'Saturn',
            'rahu': 'Rahu', 'ketu': 'Ketu',
        }
        calculation_planets = {}
        longitudes = {}
        for raw_name, raw_data in output.items():
            if not isinstance(raw_data, dict):
                continue
            canonical_name = classical_planet_names.get(str(raw_name).strip().casefold())
            if not canonical_name:
                continue
            calculation_planets[canonical_name] = raw_data
            full_degree = raw_data.get('fullDegree')
            if full_degree is not None:
                longitudes[canonical_name] = full_degree
        combust_planets = calculate_combust_planets(calculation_planets, longitudes)

        rows = []
        for planet_name, planet_data in output.items():
            if not isinstance(planet_data, dict):
                continue
            planet_key = str(planet_name).strip().casefold()
            is_retrograde = str(planet_data.get('isRetro', '')).strip().lower() in {'true', '1', 'yes'}
            try:
                degrees = planet_data.get('degrees')
                minutes = planet_data.get('minutes')
                seconds = planet_data.get('seconds')
                if degrees is not None and minutes is not None and seconds is not None:
                    degrees = int(degrees)
                    minutes = int(minutes)
                    seconds = int(round(float(seconds)))
                else:
                    degree_value = planet_data.get('normDegree')
                    if degree_value is None:
                        degree_value = float(planet_data.get('fullDegree')) % 30
                    absolute_degree = abs(float(degree_value))
                    degrees = int(absolute_degree)
                    minute_value = (absolute_degree - degrees) * 60
                    minutes = int(minute_value)
                    seconds = int(round((minute_value - minutes) * 60))

                if seconds >= 60:
                    seconds -= 60
                    minutes += 1
                if minutes >= 60:
                    minutes -= 60
                    degrees += 1
                degree_text = f'{degrees}°{minutes:02d}\'{seconds:02d}"'
            except (TypeError, ValueError, OverflowError):
                degree_text = 'N/A'

            rows.append({
                'planet': planet_data.get('localized_name') or planet_name,
                'sign': planet_data.get('zodiac_sign_name') or 'N/A',
                'degree': degree_text,
                'nakshatra': planet_data.get('nakshatra_name') or 'N/A',
                'pada': planet_data.get('nakshatra_pada') or 'N/A',
                'nakshatra_lord': planet_data.get('nakshatra_vimsottari_lord') or 'N/A',
                'karaka': karaka_by_planet.get(planet_key, 'N/A'),
                'sidereal_longitude': str(planet_data.get('fullDegree')) if planet_data.get('fullDegree') is not None else None,
                'planet_key': planet_key,
                'retrograde': is_retrograde,
                'combust': planet_key in combust_planets,
            })

        def sidereal_longitude_for(planet_name):
            planet_data = next((
                data for name, data in output.items()
                if str(name).strip().casefold() == planet_name.casefold()
            ), None)
            if not isinstance(planet_data, dict):
                return None
            longitude_value = planet_data.get('fullDegree')
            if longitude_value is None:
                longitude_value = planet_data.get('full_degree')
            return longitude_value

        yogi_report = None
        sun_longitude = sidereal_longitude_for('Sun')
        moon_longitude = sidereal_longitude_for('Moon')
        if sun_longitude is not None and moon_longitude is not None:
            try:
                yogi_report = calculate_yogi_points(sun_longitude, moon_longitude)
            except ValueError:
                yogi_report = None

        return jsonify({'success': True, 'planets': rows, 'yogi': yogi_report})
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Planets API request failed: {str(exc)}'}), 502



@app.route('/api/v1/strength/ashtakavarga', methods=['POST'])
def ashtakavarga_api():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or payload.get('time') or '').strip()
    lat = (payload.get('lat') or '').strip()
    lon = (payload.get('lon') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        os.getenv('FREE_ASTRO_API_KEY') or
        os.getenv('FREEASTRO_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({'success': False, 'error': 'No API key is configured.'}), 500

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        try:
            return float(value)
        except (TypeError, ValueError):
            return 5.5

    latitude = 28.6139
    longitude = 77.2090
    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except ValueError:
            return jsonify({'success': False, 'error': 'Latitude and longitude must be valid numbers.'}), 400
    elif place_name:
        try:
            latitude, longitude, _ = resolve_place_to_coordinates(place_name)
        except ValueError as exc:
            return jsonify({'success': False, 'error': str(exc)}), 400
        except (RuntimeError, requests.RequestException) as exc:
            return jsonify({'success': False, 'error': str(exc)}), 502

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {},
    }

    try:
        response = post_json_with_retry(
            'https://api.navamsha.in/api/v1/strength/ashtakavarga',
            request_payload,
            api_key,
            retries=2,
            timeout=45,
        )
        data = response.json()
        output = data.get('output', data) if isinstance(data, dict) else data
        if not isinstance(output, dict):
            return jsonify({'success': False, 'error': 'Unexpected Ashtakavarga response format.'}), 502
        return jsonify({'success': True, 'ashtakavarga': output})
    except (requests.RequestException, ValueError) as exc:
        return jsonify({'success': False, 'error': f'Ashtakavarga request failed: {str(exc)}'}), 502


@app.route('/api/v1/astrology/kundli/advanced', methods=['POST'])
@app.route('/api/kundli/advanced', methods=['POST'])
def kundli_advanced():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or payload.get('time') or '').strip()
    lat = (payload.get('lat') or '').strip()
    lon = (payload.get('lon') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({'success': False, 'error': 'No API key configured'}), 500

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        try:
            return float(value)
        except Exception:
            return 5.5

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    latitude = 28.6139
    longitude = 77.2090
    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except Exception:
            pass
    elif place_name:
        try:
            latitude, longitude, _ = resolve_place_to_coordinates(place_name)
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {}
    }

    try:
        resp = requests.post(
            'https://api.navamsha.in/api/v1/astrology/kundli/advanced',
            json=request_payload,
            headers={'x-api-key': api_key, 'Content-Type': 'application/json'},
            timeout=30,
        )
        if resp.status_code == 401:
            return jsonify({'success': False, 'error': 'Navamsha API rejected the API key'}), 401
        resp.raise_for_status()
        data = resp.json()

        def normalize_balance(value):
            if isinstance(value, dict):
                for key in ('duration', 'balance', 'value', 'remaining', 'description'):
                    candidate = value.get(key)
                    if candidate is not None and str(candidate).strip():
                        return candidate
                return 'N/A'
            return value if value is not None else 'N/A'

        dasha_output = data.get('output') if isinstance(data, dict) else {}
        if not isinstance(dasha_output, dict):
            dasha_output = {}
        periods = dasha_output.get('dasha_periods') or []
        balance_output = dasha_output
        birth_balance = dasha_output.get('dasha_balance') or dasha_output.get('birth_dasha_balance')

        if birth_balance is None or normalize_balance(birth_balance) == 'N/A':
            try:
                balance_response = post_json_with_retry(
                    'https://api.navamsha.in/api/v1/astrology/dasha-periods',
                    request_payload,
                    api_key,
                    retries=2,
                    timeout=30,
                )
                balance_data = balance_response.json()
                fallback_output = balance_data.get('output') if isinstance(balance_data, dict) else {}
                if isinstance(fallback_output, dict):
                    balance_output = fallback_output
                    birth_balance = fallback_output.get('dasha_balance') or fallback_output.get('birth_dasha_balance')
                    if not periods:
                        periods = fallback_output.get('dasha_periods') or []
            except (requests.RequestException, ValueError):
                pass

        rows = []
        if isinstance(periods, list):
            for item in periods:
                if isinstance(item, dict):
                    period_name = item.get('name') or item.get('planet') or item.get('lord') or 'N/A'
                    antardasha_items = item.get('antardasha') or item.get('antardashas') or item.get('sub_periods') or []
                    antardasha_rows = []
                    if isinstance(antardasha_items, list):
                        for antardasha in antardasha_items:
                            if not isinstance(antardasha, dict):
                                continue
                            antardasha_rows.append({
                                'planet': antardasha.get('name') or antardasha.get('planet') or antardasha.get('lord') or 'N/A',
                                'start_date': antardasha.get('start') or antardasha.get('start_date') or 'N/A',
                                'end_date': antardasha.get('end') or antardasha.get('end_date') or 'N/A',
                            })
                    rows.append({
                        'planet': period_name,
                        'period': period_name,
                        'start_date': item.get('start') or item.get('start_date') or 'N/A',
                        'end_date': item.get('end') or item.get('end_date') or 'N/A',
                        'antardasha': antardasha_rows,
                    })

        current_period = None
        try:
            current_response = post_json_with_retry(
                'https://api.navamsha.in/api/v1/dasha/current',
                request_payload,
                api_key,
                retries=2,
                timeout=30,
            )
            current_data = current_response.json()
            current_output = current_data.get('output') if isinstance(current_data, dict) else None
            if isinstance(current_output, dict):
                current_period = {
                    'mahadasha': current_output.get('mahadasha'),
                    'antardasha': current_output.get('antardasha'),
                }
        except (requests.RequestException, ValueError):
            current_period = None

        birth_balance_value = normalize_balance(birth_balance)
        birth_balance_lord = None
        if isinstance(birth_balance, dict):
            birth_balance_lord = birth_balance.get('lord')
            if isinstance(birth_balance_lord, dict):
                birth_balance_lord = birth_balance_lord.get('name') or birth_balance_lord.get('planet') or birth_balance_lord.get('lord')
            elif isinstance(birth_balance_lord, str):
                birth_balance_lord = birth_balance_lord

        # Some provider payloads keep the lord on a nested raw output object instead of the top-level balance object.
        if not birth_balance_lord:
            nested_balance = balance_output.get('dasha_balance') or balance_output.get('birth_dasha_balance')
            nested_lord = nested_balance.get('lord') if isinstance(nested_balance, dict) else None
            if isinstance(nested_lord, dict):
                birth_balance_lord = nested_lord.get('name') or nested_lord.get('planet') or nested_lord.get('lord')
            elif isinstance(nested_lord, str):
                birth_balance_lord = nested_lord

        return jsonify({
            'success': True,
            'dasha': {
                'periods': rows,
                'current': current_period,
                'birth_dasha_balance': birth_balance_value,
                'birth_dasha_lord': birth_balance_lord or 'N/A',
                'raw': data
            }
        })
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Advanced kundli request failed: {str(exc)}'}), 502


@app.route('/api/chart-svg', methods=['POST'])
def chart_svg():
    payload = request.get_json(silent=True) or {}
    dob = (payload.get('dob') or '').strip()
    tob = (payload.get('tob') or payload.get('time') or '').strip()
    lat = (payload.get('lat') or '').strip()
    lon = (payload.get('lon') or '').strip()
    place_name = (payload.get('place') or payload.get('place_name') or '').strip()
    tz = payload.get('tz', payload.get('timezone'))

    if not dob or not tob:
        return jsonify({'success': False, 'error': 'dob and tob are required'}), 400

    api_key = (
        os.getenv('NAVAMSHA_API_KEY') or
        os.getenv('VDA_API_KEY') or
        ''
    ).strip()
    if not api_key:
        return jsonify({'success': False, 'error': 'No API key configured'}), 500

    try:
        date_obj = datetime.strptime(dob, '%Y-%m-%d')
        time_obj = datetime.strptime(tob, '%H:%M')
    except ValueError:
        return jsonify({'success': False, 'error': 'dob must be YYYY-MM-DD and tob must be HH:MM'}), 400

    def parse_timezone(value):
        if value in (None, '', 'AUTO'):
            return 5.5
        try:
            return float(value)
        except Exception:
            return 5.5

    latitude = 28.6139
    longitude = 77.2090

    if lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except Exception:
            pass
    elif place_name:
        try:
            latitude, longitude, _ = resolve_place_to_coordinates(place_name)
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400

    request_payload = {
        'year': date_obj.year,
        'month': date_obj.month,
        'date': date_obj.day,
        'hours': time_obj.hour,
        'minutes': time_obj.minute,
        'seconds': 0,
        'latitude': latitude,
        'longitude': longitude,
        'timezone': parse_timezone(tz),
        'settings': {
            'observation_point': 'geocentric',
            'ayanamsha': 'lahiri'
        }
    }

    try:
        response = post_json_with_retry(
            'https://api.navamsha.in/api/v1/kundali/complete',
            request_payload,
            api_key,
            retries=3,
            timeout=30,
        )
        response_data = response.json()
        output = response_data.get('output') if isinstance(response_data, dict) else None
        if not isinstance(output, dict):
            return jsonify({'success': False, 'error': 'Unexpected kundali/complete response format'}), 502

        planets = output.get('planets')
        ascendant = output.get('ascendant')
        if not isinstance(planets, dict) or not isinstance(ascendant, dict):
            return jsonify({'success': False, 'error': 'Kundali response did not include chart placements'}), 502
        longitudes = output.get('longitudes') if isinstance(output.get('longitudes'), dict) else {}
        combust_planets = calculate_combust_planets(planets, longitudes)

        import xml.etree.ElementTree as ET

        svg_namespace = 'http://www.w3.org/2000/svg'
        ET.register_namespace('', svg_namespace)
        svg = ET.Element(f'{{{svg_namespace}}}svg', {
            'viewBox': '0 0 480 480',
            'role': 'img',
            'aria-label': 'North Indian Vedic birth chart',
            'data-source': 'kundali-complete'
        })
        line_color = '#B5A886'
        planet_color = '#D4A72C'
        sign_color = '#A7352B'
        frame = ET.SubElement(svg, f'{{{svg_namespace}}}rect', {
            'x': '20', 'y': '20', 'width': '440', 'height': '440',
            'fill': 'none', 'stroke': line_color, 'stroke-width': '2'
        })

        def add_line(x1, y1, x2, y2):
            ET.SubElement(svg, f'{{{svg_namespace}}}line', {
                'x1': str(x1), 'y1': str(y1), 'x2': str(x2), 'y2': str(y2),
                'stroke': line_color, 'stroke-width': '1.5'
            })

        add_line(20, 20, 460, 460)
        add_line(460, 20, 20, 460)
        add_line(240, 20, 20, 240)
        add_line(20, 240, 240, 460)
        add_line(460, 240, 240, 20)
        add_line(240, 460, 460, 240)

        house_centers = {
            1: (240, 105), 2: (145, 75), 3: (75, 145), 4: (105, 240),
            5: (75, 335), 6: (145, 405), 7: (240, 375), 8: (335, 405),
            9: (405, 335), 10: (375, 240), 11: (405, 145), 12: (335, 75)
        }
        zodiac_signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
        sign_number = ascendant.get('current_sign')
        try:
            asc_sign_number = int(sign_number)
        except (TypeError, ValueError):
            asc_sign_number = zodiac_signs.index(ascendant.get('zodiac_sign_name')) + 1 if ascendant.get('zodiac_sign_name') in zodiac_signs else 1

        planets_by_house = {house: [] for house in range(1, 13)}
        planets_by_house[1].append(('Asc', ascendant, False))
        abbreviations = {
            'sun': 'Su', 'moon': 'Mo', 'mars': 'Ma', 'mercury': 'Me',
            'jupiter': 'Ju', 'venus': 'Ve', 'saturn': 'Sa', 'rahu': 'Ra', 'ketu': 'Ke'
        }
        for planet_name, planet_data in planets.items():
            abbreviation = abbreviations.get(str(planet_name).lower())
            if not abbreviation or not isinstance(planet_data, dict):
                continue
            try:
                house_number = int(planet_data.get('house_number'))
            except (TypeError, ValueError):
                house_number = 0
            if house_number not in planets_by_house:
                sign = planet_data.get('current_sign')
                try:
                    house_number = ((int(sign) - asc_sign_number + 12) % 12) + 1
                except (TypeError, ValueError):
                    continue
            planets_by_house[house_number].append((
                abbreviation,
                planet_data,
                str(planet_name).lower() in combust_planets
            ))

        for house_number, (x, y) in house_centers.items():
            sign_for_house = ((asc_sign_number + house_number - 2) % 12) + 1
            sign_text = ET.SubElement(svg, f'{{{svg_namespace}}}text', {
                'x': str(x), 'y': str(y - 25), 'text-anchor': 'middle',
                'font-size': '12', 'font-family': 'sans-serif', 'fill': sign_color
            })
            sign_text.text = str(sign_for_house)

            house_planets = planets_by_house[house_number]
            line_height = 16 if len(house_planets) > 4 else 19
            start_y = y - ((len(house_planets) - 1) * line_height / 2) + 5
            for index, (label, planet_data, is_combust) in enumerate(house_planets):
                retrograde = str(planet_data.get('isRetro', '')).lower() == 'true' and label != 'Asc'
                label_text = f'{label}{" C" if is_combust else ""}{" R" if retrograde else ""}'
                ET.SubElement(svg, f'{{{svg_namespace}}}text', {
                    'x': str(x), 'y': str(round(start_y + index * line_height, 1)),
                    'text-anchor': 'middle', 'dominant-baseline': 'middle',
                    'font-size': '13', 'font-family': 'sans-serif',
                    'font-weight': '600', 'fill': planet_color
                }).text = label_text

        return jsonify({'success': True, 'svg': ET.tostring(svg, encoding='unicode')})
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'SVG API request failed: {str(exc)}'}), 502


@app.route('/api/register', methods=['POST'])
def register():
    payload = request.get_json(silent=True) or {}
    full_name = (payload.get('full_name') or '').strip()
    dob = (payload.get('dob') or '').strip()
    phone = (payload.get('phone') or '').strip()
    otp = str(payload.get('otp') or '').strip()

    if not full_name or not phone or not otp:
        return jsonify({'success': False, 'error': 'Name, phone number and OTP are required'}), 400

    if not validate_otp(phone, otp):
        return jsonify({'success': False, 'error': 'Invalid or expired OTP'}), 400

    try:
        with get_db() as conn:
            cursor = conn.execute(
                'INSERT INTO users (full_name, dob, phone) VALUES (?, ?, ?)',
                (full_name, dob, phone),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'error': 'User with this phone number already exists'}), 409

    token = create_session(user_id)
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user_id,
            'full_name': full_name,
            'dob': dob,
            'phone': phone,
        }
    })


@app.route('/api/login', methods=['POST'])
def login():
    payload = request.get_json(silent=True) or {}
    phone = (payload.get('phone') or '').strip()
    otp = str(payload.get('otp') or '').strip()

    if not phone or not otp:
        return jsonify({'success': False, 'error': 'Phone number and OTP are required'}), 400

    if not validate_otp(phone, otp):
        return jsonify({'success': False, 'error': 'Invalid or expired OTP'}), 400

    with get_db() as conn:
        user = conn.execute('SELECT * FROM users WHERE phone = ?', (phone,)).fetchone()

    if user is None:
        return jsonify({'success': False, 'error': 'No user found for this phone number'}), 404

    token = create_session(user['id'])
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user['id'],
            'full_name': user['full_name'],
            'dob': user['dob'],
            'phone': user['phone'],
        }
    })


@app.route('/api/me', methods=['GET'])
def me():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    user = get_user_from_token(token)
    if user is None:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'full_name': user['full_name'],
            'dob': user['dob'],
            'phone': user['phone'],
        }
    })


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/chart', strict_slashes=False)
def chart_page():
    return app.send_static_file('index.html')


@app.route('/__debug_version')
def debug_version():
    try:
        import os
        return jsonify({'app_path': __file__, 'mtime': os.path.getmtime(__file__)})
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=PORT, debug=False)
