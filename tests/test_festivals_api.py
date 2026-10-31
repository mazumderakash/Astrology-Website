import unittest
from unittest.mock import Mock, patch

import requests

import app


class BdaFestivalApiTests(unittest.TestCase):
    def setUp(self):
        app._BDA_FESTIVAL_CACHE.clear()
        app.app.config['TESTING'] = True
        self.location = {
            'lat': '22.5726',
            'lng': '88.3639',
            'tz': 'Asia/Kolkata',
        }

    def tearDown(self):
        app._BDA_FESTIVAL_CACHE.clear()

    @staticmethod
    def response(payload, status=200, headers=None):
        response = Mock()
        response.status_code = status
        response.headers = headers or {}
        response.json.return_value = payload
        return response

    @staticmethod
    def invoke(route, view, *args):
        with app.app.test_request_context(route, method='GET'):
            result = view(*args)
        if isinstance(result, tuple):
            response, status = result[:2]
            response.status_code = status
            return response
        return result

    @patch('app.requests.get')
    def test_calendar_forwards_location_year_and_leap_year_range(self, get):
        upstream = {
            'festivals': [{'key': 'holi', 'date': '2028-03-11'}],
            'pending_festivals': [],
            '_meta': {'license': 'CC-BY-SA-4.0'},
        }
        get.return_value = self.response(upstream)

        result = self.invoke('/api/festivals?year=2028&lat=22.5726&lng=88.3639&tz=Asia%2FKolkata', app.bda_festivals_api)

        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.get_json(), upstream)
        self.assertEqual(result.headers['X-BDA-Cache'], 'MISS')
        self.assertEqual(get.call_args.args[0], 'https://jyotish-api.bda.ai/panchang/festivals')
        self.assertEqual(get.call_args.kwargs['params'], {
            'lat': 22.5726,
            'lng': 88.3639,
            'tz': 'Asia/Kolkata',
            'from_date': '2028-01-01',
            'days': 366,
            'include_aliases': True,
            'include_popular': True,
        })

    @patch('app.requests.get')
    def test_calendar_cache_is_keyed_by_full_location_and_year(self, get):
        get.return_value = self.response({'festivals': [], '_meta': {}})
        route = '/api/festivals?year=2026&lat=22.5726&lng=88.3639&tz=Asia%2FKolkata'

        first = self.invoke(route, app.bda_festivals_api)
        second = self.invoke(route, app.bda_festivals_api)

        self.assertEqual(first.headers['X-BDA-Cache'], 'MISS')
        self.assertEqual(second.headers['X-BDA-Cache'], 'HIT')
        get.assert_called_once()

    def test_rejects_invalid_coordinates_and_timezone_without_upstream_call(self):
        result = self.invoke('/api/festivals?year=2026&lat=91&lng=88.3&tz=Asia%2FKolkata', app.bda_festivals_api)
        invalid_timezone = self.invoke('/api/festivals?year=2026&lat=22&lng=88&tz=Not%2FAZone', app.bda_festivals_api)

        self.assertEqual(result.status_code, 400)
        self.assertEqual(invalid_timezone.status_code, 400)

    @patch('app.requests.get')
    def test_retries_are_honored_for_saturated_capacity(self, get):
        get.return_value = self.response(
            {'code': 'capacity_saturated', 'message': 'Please retry shortly.'},
            status=503,
            headers={'Retry-After': '4'},
        )

        result = self.invoke('/api/festivals?year=2026&lat=22&lng=88&tz=Asia%2FKolkata', app.bda_festivals_api)

        self.assertEqual(result.status_code, 503)
        self.assertEqual(result.headers['Retry-After'], '4')
        self.assertTrue(result.get_json()['retryable'])

    @patch('app.requests.get')
    def test_reserved_capacity_is_not_marked_retryable(self, get):
        get.return_value = self.response({'code': 'capacity_reserved'}, status=503)

        result = self.invoke('/api/festivals?year=2026&lat=22&lng=88&tz=Asia%2FKolkata', app.bda_festivals_api)

        self.assertEqual(result.status_code, 503)
        self.assertFalse(result.get_json()['retryable'])

    @patch('app.requests.get')
    def test_detail_endpoint_forwards_rule_key_and_maps_timeout(self, get):
        get.return_value = self.response({'festival': {'key': 'diwali'}, '_meta': {}})
        detail = self.invoke('/api/festivals/diwali?year=2026&lat=22&lng=88&tz=Asia%2FKolkata', app.bda_festival_detail_api, 'diwali')

        self.assertEqual(detail.status_code, 200)
        self.assertEqual(get.call_args.args[0], 'https://jyotish-api.bda.ai/panchang/festival/diwali')
        self.assertEqual(get.call_args.kwargs['params']['year'], 2026)

        app._BDA_FESTIVAL_CACHE.clear()
        get.side_effect = requests.Timeout()
        timed_out = self.invoke('/api/festivals/diwali?year=2026&lat=22&lng=88&tz=Asia%2FKolkata', app.bda_festival_detail_api, 'diwali')
        self.assertEqual(timed_out.status_code, 504)

    def test_rejects_invalid_rule_key(self):
        result = self.invoke('/api/festivals/not_valid?year=2026&lat=22&lng=88&tz=Asia%2FKolkata', app.bda_festival_detail_api, 'not_valid')

        self.assertEqual(result.status_code, 400)


if __name__ == '__main__':
    unittest.main()