from decimal import Decimal, InvalidOperation, localcontext


ARCSECONDS_PER_DEGREE = Decimal(3600)
ARCSECONDS_PER_MINUTE = Decimal(60)
ARCSECONDS_PER_NAKSHATRA = Decimal(48000)
ARCSECONDS_PER_PADA = Decimal(12000)
ARCSECONDS_PER_SIGN = Decimal(108000)
ARCSECONDS_PER_CIRCLE = Decimal(1296000)
YOGI_OFFSET_ARCSECONDS = Decimal(336000)
AVAYOGI_OFFSET_ARCSECONDS = Decimal(672000)

SIGNS = (
    ('Aries', 'Mars'),
    ('Taurus', 'Venus'),
    ('Gemini', 'Mercury'),
    ('Cancer', 'Moon'),
    ('Leo', 'Sun'),
    ('Virgo', 'Mercury'),
    ('Libra', 'Venus'),
    ('Scorpio', 'Mars'),
    ('Sagittarius', 'Jupiter'),
    ('Capricorn', 'Saturn'),
    ('Aquarius', 'Saturn'),
    ('Pisces', 'Jupiter'),
)

NAKSHATRAS = (
    ('Ashwini', 'Ketu'),
    ('Bharani', 'Venus'),
    ('Krittika', 'Sun'),
    ('Rohini', 'Moon'),
    ('Mrigashira', 'Mars'),
    ('Ardra', 'Rahu'),
    ('Punarvasu', 'Jupiter'),
    ('Pushya', 'Saturn'),
    ('Ashlesha', 'Mercury'),
    ('Magha', 'Ketu'),
    ('Purva Phalguni', 'Venus'),
    ('Uttara Phalguni', 'Sun'),
    ('Hasta', 'Moon'),
    ('Chitra', 'Mars'),
    ('Swati', 'Rahu'),
    ('Vishakha', 'Jupiter'),
    ('Anuradha', 'Saturn'),
    ('Jyeshtha', 'Mercury'),
    ('Mula', 'Ketu'),
    ('Purva Ashadha', 'Venus'),
    ('Uttara Ashadha', 'Sun'),
    ('Shravana', 'Moon'),
    ('Dhanishta', 'Mars'),
    ('Shatabhisha', 'Rahu'),
    ('Purva Bhadrapada', 'Jupiter'),
    ('Uttara Bhadrapada', 'Saturn'),
    ('Revati', 'Mercury'),
)


def _as_decimal(value):
    try:
        number = value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError('Longitude must be a finite number.') from exc
    if not number.is_finite():
        raise ValueError('Longitude must be a finite number.')
    return number


def _normalize_arcseconds(arcseconds):
    value = _as_decimal(arcseconds)
    return (value % ARCSECONDS_PER_CIRCLE + ARCSECONDS_PER_CIRCLE) % ARCSECONDS_PER_CIRCLE


def _format_decimal(value):
    formatted = format(value, 'f')
    if '.' in formatted:
        formatted = formatted.rstrip('0').rstrip('.')
    return formatted or '0'


def _format_seconds(seconds):
    formatted = _format_decimal(seconds)
    return f'0{formatted}' if seconds < Decimal(10) else formatted


def describe_sidereal_arcseconds(arcseconds):
    """Classify an absolute sidereal longitude supplied in arcseconds."""
    normalized = _normalize_arcseconds(arcseconds)
    sign_index = int(normalized // ARCSECONDS_PER_SIGN)
    nakshatra_index = int(normalized // ARCSECONDS_PER_NAKSHATRA)
    within_nakshatra = normalized - Decimal(nakshatra_index) * ARCSECONDS_PER_NAKSHATRA
    pada = int(within_nakshatra // ARCSECONDS_PER_PADA) + 1

    whole_degrees = int(normalized // ARCSECONDS_PER_DEGREE)
    remainder = normalized - Decimal(whole_degrees) * ARCSECONDS_PER_DEGREE
    whole_minutes = int(remainder // ARCSECONDS_PER_MINUTE)
    seconds = remainder - Decimal(whole_minutes) * ARCSECONDS_PER_MINUTE
    with localcontext() as context:
        context.prec = max(28, len(normalized.as_tuple().digits) + 12)
        longitude_degrees = normalized / ARCSECONDS_PER_DEGREE

    sign_name, sign_lord = SIGNS[sign_index]
    nakshatra_name, nakshatra_lord = NAKSHATRAS[nakshatra_index]
    point = {
        'longitude': _format_decimal(longitude_degrees),
        'dms': f'{whole_degrees}°{whole_minutes:02d}′{_format_seconds(seconds)}″',
        'degrees': whole_degrees,
        'minutes': whole_minutes,
        'seconds': _format_decimal(seconds),
    }
    return {
        'point': point,
        'sign': {'name': sign_name, 'lord': sign_lord},
        'nakshatra': {'name': nakshatra_name, 'pada': pada, 'lord': nakshatra_lord},
    }


def calculate_yogi_points(sun_sidereal_longitude, moon_sidereal_longitude):
    """Calculate Yogi, Duplicate Yogi, and Avayogi from sidereal longitudes."""
    sun_arcseconds = _as_decimal(sun_sidereal_longitude) * ARCSECONDS_PER_DEGREE
    moon_arcseconds = _as_decimal(moon_sidereal_longitude) * ARCSECONDS_PER_DEGREE
    yogi_arcseconds = _normalize_arcseconds(
        sun_arcseconds + moon_arcseconds + YOGI_OFFSET_ARCSECONDS
    )
    avayogi_arcseconds = _normalize_arcseconds(
        yogi_arcseconds + AVAYOGI_OFFSET_ARCSECONDS
    )

    yogi = describe_sidereal_arcseconds(yogi_arcseconds)
    avayogi = describe_sidereal_arcseconds(avayogi_arcseconds)
    return {
        'yogiPoint': yogi['point'],
        'yogiSign': yogi['sign'],
        'yogiNakshatra': yogi['nakshatra'],
        'yogiPlanet': yogi['nakshatra']['lord'],
        'duplicateYogi': yogi['sign']['lord'],
        'avayogiPoint': avayogi['point'],
        'avayogiSign': avayogi['sign'],
        'avayogiNakshatra': avayogi['nakshatra'],
        'avayogiPlanet': avayogi['nakshatra']['lord'],
    }