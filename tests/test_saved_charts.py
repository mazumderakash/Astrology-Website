import json
import unittest
import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import app


class FakeCursor:
    def __init__(self, description=(), rows=()):
        self.description = [(name,) for name in description]
        self.rows = list(rows)
        self.rowcount = len(self.rows)

    def fetchall(self):
        return self.rows

    def fetchone(self):
        return self.rows[0] if self.rows else None


class FakeSavedChartsConnection:
    def __init__(self, chart_id=None, chart_state=None, delete_found=True):
        self.chart_id = chart_id or uuid.uuid4()
        self.chart_state = chart_state or {}
        self.delete_found = delete_found
        self.queries = []
        self.committed = False

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception, traceback):
        self.committed = exception_type is None

    def execute(self, query, params=()):
        normalized_query = ' '.join(query.split())
        self.queries.append((normalized_query, params))
        if normalized_query.startswith('INSERT INTO saved_charts'):
            return FakeCursor(
                ('id', 'chart_name', 'created_at'),
                [(params[0], params[2], datetime(2026, 1, 1, tzinfo=timezone.utc))],
            )
        if normalized_query.startswith('UPDATE saved_charts'):
            return FakeCursor(
                ('id', 'chart_name', 'created_at'),
                [(params[-2], params[0], datetime(2026, 1, 1, tzinfo=timezone.utc))],
            )
        if normalized_query.startswith('DELETE FROM saved_charts'):
            rows = [(params[0],)] if self.delete_found else []
            return FakeCursor(('id',), rows)
        if 'SELECT chart_state FROM saved_charts' in normalized_query:
            return FakeCursor(('chart_state',), [(self.chart_state,)])
        if 'SELECT id, chart_name, birth_date, birth_time, birth_place, created_at' in normalized_query:
            return FakeCursor(
                ('id', 'chart_name', 'birth_date', 'birth_time', 'birth_place', 'created_at'),
                [(self.chart_id, 'Natal chart', '2000-01-01', '12:00', 'Delhi', datetime(2026, 1, 1, tzinfo=timezone.utc))],
            )
        return FakeCursor()


class SavedChartsApiTests(unittest.TestCase):
    def setUp(self):
        self.user = {'id': 42}
        self.chart_state = {
            'name': 'Natal chart',
            'payload': {'dob': '2000-01-01', 'tob': '12:00', 'place': 'Delhi'},
            'chartData': {'chart': {'ascendant': 'Aries'}},
        }

    def invoke(self, route, method='GET', payload=None, connection=None):
        headers = {'Authorization': 'Bearer test-token'}
        with patch('app.get_saved_charts_user', return_value=self.user):
            with patch('app.get_saved_charts_connection', return_value=connection):
                with app.app.test_request_context(route, method=method, json=payload, headers=headers):
                    result = app.saved_charts_api() if route == '/api/saved-charts' else app.saved_chart_detail_api(route.rsplit('/', 1)[-1])
        response, status = result if isinstance(result, tuple) else (result, 200)
        return response.get_json(), status

    def test_save_stores_chart_snapshot_as_json_and_uses_authenticated_owner(self):
        connection = FakeSavedChartsConnection()
        data, status = self.invoke(
            '/api/saved-charts',
            method='POST',
            payload={'chart': self.chart_state},
            connection=connection,
        )

        self.assertEqual(status, 201)
        self.assertTrue(connection.committed)
        insert_query, params = next(query for query in connection.queries if query[0].startswith('INSERT INTO saved_charts'))
        self.assertIn('user_id', insert_query)
        self.assertEqual(params[1], self.user['id'])
        self.assertEqual(json.loads(params[6]), self.chart_state)
        self.assertEqual(data['chart']['name'], 'Natal chart')

    def test_list_is_scoped_to_authenticated_owner(self):
        connection = FakeSavedChartsConnection()
        data, status = self.invoke('/api/saved-charts', connection=connection)

        self.assertEqual(status, 200)
        list_query, params = next(query for query in connection.queries if 'ORDER BY created_at DESC' in query[0])
        self.assertIn('WHERE user_id = %s', list_query)
        self.assertEqual(params, (self.user['id'],))
        self.assertEqual(data['charts'][0]['name'], 'Natal chart')

    def test_load_is_scoped_to_authenticated_owner(self):
        chart_id = uuid.uuid4()
        connection = FakeSavedChartsConnection(chart_id=chart_id, chart_state=self.chart_state)
        data, status = self.invoke(f'/api/saved-charts/{chart_id}', connection=connection)

        self.assertEqual(status, 200)
        detail_query, params = next(query for query in connection.queries if 'SELECT chart_state FROM saved_charts' in query[0])
        self.assertIn('id = %s AND user_id = %s', detail_query)
        self.assertEqual(params, (chart_id, self.user['id']))
        self.assertEqual(data['chart'], self.chart_state)

    def test_update_is_scoped_to_authenticated_owner(self):
        chart_id = uuid.uuid4()
        connection = FakeSavedChartsConnection(chart_id=chart_id)
        updated_state = {
            **self.chart_state,
            'name': 'Updated chart',
            'payload': {**self.chart_state['payload'], 'place': 'Mumbai'},
        }
        data, status = self.invoke(
            f'/api/saved-charts/{chart_id}',
            method='PUT',
            payload={'chart': updated_state},
            connection=connection,
        )

        self.assertEqual(status, 200)
        self.assertTrue(connection.committed)
        update_query, params = next(query for query in connection.queries if query[0].startswith('UPDATE saved_charts'))
        self.assertIn('WHERE id = %s AND user_id = %s', update_query)
        self.assertEqual(params[-2:], (chart_id, self.user['id']))
        self.assertEqual(data['chart']['name'], 'Updated chart')

    def test_delete_is_scoped_to_authenticated_owner(self):
        chart_id = uuid.uuid4()
        connection = FakeSavedChartsConnection(chart_id=chart_id)
        data, status = self.invoke(f'/api/saved-charts/{chart_id}', method='DELETE', connection=connection)

        self.assertEqual(status, 200)
        self.assertTrue(connection.committed)
        delete_query, params = next(query for query in connection.queries if query[0].startswith('DELETE FROM saved_charts'))
        self.assertIn('WHERE id = %s AND user_id = %s', delete_query)
        self.assertEqual(params, (chart_id, self.user['id']))
        self.assertTrue(data['success'])

    def test_delete_returns_not_found_for_unknown_chart(self):
        connection = FakeSavedChartsConnection(delete_found=False)
        data, status = self.invoke(
            f'/api/saved-charts/{uuid.uuid4()}',
            method='DELETE',
            connection=connection,
        )

        self.assertEqual(status, 404)
        self.assertFalse(data['success'])


if __name__ == '__main__':
    unittest.main()