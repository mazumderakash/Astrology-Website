from flask import Flask, jsonify, request
import os
import random
import sqlite3
import time
import uuid
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv

app = Flask(__name__, static_folder='public', static_url_path='')
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'jyotishx.db')
load_dotenv(os.path.join(BASE_DIR, '.env'))
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
        headers={'User-Agent': 'JyotishX/1.0'},
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
            'day': panchang_output.get('vaara') if isinstance(panchang_output, dict) else None,
            'tithi': (tithi_list[0].get('name') if isinstance(tithi_list, list) and tithi_list else None),
            'paksha': (tithi_list[0].get('paksha') if isinstance(tithi_list, list) and tithi_list else None),
            'karana': (karana_list[0].get('name') if isinstance(karana_list, list) and karana_list else None),
            'yoga': (yoga_list[0].get('name') if isinstance(yoga_list, list) and yoga_list else None),
            'sunrise': as_time_only(panchang_output.get('sunrise')) if isinstance(panchang_output, dict) else None,
            'sunset': as_time_only(panchang_output.get('sunset')) if isinstance(panchang_output, dict) else None,
        }

        # Try to fetch ascendant details from Navamsha chart endpoint
        ascendant_summary = None
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

        rows = []
        for planet_name, planet_data in output.items():
            if not isinstance(planet_data, dict):
                continue
            degree_value = planet_data.get('normDegree')
            if degree_value is None:
                degree_value = planet_data.get('fullDegree')
            try:
                if isinstance(degree_value, (int, float)):
                    degree_text = f"{float(degree_value):.2f}°"
                else:
                    degree_text = str(degree_value or 'N/A')
            except Exception:
                degree_text = str(degree_value or 'N/A')

            rows.append({
                'planet': planet_data.get('localized_name') or planet_name,
                'sign': planet_data.get('zodiac_sign_name') or 'N/A',
                'degree': degree_text,
                'nakshatra': planet_data.get('nakshatra_name') or 'N/A',
                'pada': planet_data.get('nakshatra_pada') or 'N/A',
                'nakshatra_lord': planet_data.get('nakshatra_vimsottari_lord') or 'N/A'
            })

        return jsonify({'success': True, 'planets': rows})
    except requests.RequestException as exc:
        return jsonify({'success': False, 'error': f'Planets API request failed: {str(exc)}'}), 502



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
                return (
                    value.get('duration')
                    or value.get('balance')
                    or value.get('value')
                    or value.get('remaining')
                    or value.get('description')
                    or 'N/A'
                )
            return value if value is not None else 'N/A'

        dasha_output = data.get('output') if isinstance(data, dict) else {}
        periods = dasha_output.get('dasha_periods') if isinstance(dasha_output, dict) else []
        rows = []
        if isinstance(periods, list):
            for item in periods:
                if isinstance(item, dict):
                    rows.append({
                        'planet': item.get('name') or item.get('planet') or item.get('lord') or 'N/A',
                        'period': item.get('name') or item.get('period') or 'N/A',
                        'start_date': item.get('start') or item.get('start_date') or 'N/A',
                        'end_date': item.get('end') or item.get('end_date') or 'N/A'
                    })

        birth_balance = dasha_output.get('dasha_balance') if isinstance(dasha_output, dict) else None
        birth_balance_value = normalize_balance(birth_balance)
        birth_balance_lord = None
        if isinstance(birth_balance, dict):
            birth_balance_lord = birth_balance.get('lord')
            if isinstance(birth_balance_lord, dict):
                birth_balance_lord = birth_balance_lord.get('name') or birth_balance_lord.get('planet') or birth_balance_lord.get('lord')
            elif isinstance(birth_balance_lord, str):
                birth_balance_lord = birth_balance_lord

        # Some provider payloads keep the lord on a nested raw output object instead of the top-level balance object.
        if not birth_balance_lord and isinstance(data, dict):
            raw_output = data.get('output') if isinstance(data.get('output'), dict) else {}
            nested_lord = raw_output.get('dasha_balance', {}).get('lord') if isinstance(raw_output.get('dasha_balance'), dict) else None
            if isinstance(nested_lord, dict):
                birth_balance_lord = nested_lord.get('name') or nested_lord.get('planet') or nested_lord.get('lord')
            elif isinstance(nested_lord, str):
                birth_balance_lord = nested_lord

        return jsonify({
            'success': True,
            'dasha': {
                'periods': rows,
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
        'settings': {}
    }

    try:
        resp = post_json_with_retry(
            'https://api.navamsha.in/api/v1/horoscope-chart-svg-code',
            request_payload,
            api_key,
            retries=3,
            timeout=30,
        )
        j = resp.json()
        # Try to locate svg string anywhere in response
        svg = find_string_with_svg(j) or ''
        if not svg:
            # attempt common places
            out = j.get('output') if isinstance(j, dict) else None
            if isinstance(out, dict):
                for k in ('svg', 'svg_code', 'svgHtml', 'svgString'):
                    if out.get(k):
                        svg = out.get(k)
                        break

        if not svg:
            return jsonify({'success': False, 'error': 'SVG not found in provider response', 'raw': j}), 502

        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(svg)
            forbidden = {'NE', 'PL', 'UR', 'NEPTUNE', 'PLUTO', 'URANUS'}
            for node in list(root.iter()):
                if node.tag.endswith('text'):
                    try:
                        text_value = ''.join(node.itertext()).replace('\n', '').replace('\r', '').replace('\t', '').strip()
                    except Exception:
                        text_value = ''
                    compact = ''.join(ch for ch in text_value if ch.isalpha()).upper()
                    if compact in forbidden or compact.startswith('NE') or compact.startswith('PL') or compact.startswith('UR'):
                        parent = node.getparent() if hasattr(node, 'getparent') else None
                        if parent is not None:
                            parent.remove(node)
                        elif node in list(root):
                            root.remove(node)
            svg = ET.tostring(root, encoding='unicode')
        except Exception:
            svg = re.sub(r'(?is)<text[^>]*>.*?(?:Pl|Ur|Ne)[^<]*</text>', '', svg)

        return jsonify({'success': True, 'svg': svg})
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
