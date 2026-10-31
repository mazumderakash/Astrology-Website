import json
import unittest
import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import app


class FakeCursor:
    def __init__(self, description, row=None, rows=None):
        self.description = [(column,) for column in description]
        self.row = row
        self.rows = rows or []

    def fetchone(self):
        return self.row

    def fetchall(self):
        return self.rows


class FakeSavedNumerologyConnection:
    def __init__(self, user_id=42, profile=None):
        self.queries = []
        self.committed = False
        self.profile_id = uuid.uuid4()
        self.user_id = user_id
        self.profile = profile or {
            'name': 'Ada Lovelace',
            'dateOfBirth': '1815-12-10',
            'numberSystem': 'chaldean',
            'numbers': {},
        }

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception, traceback):
        self.committed = exception_type is None

    def execute(self, query, params=()):
        normalized_query = ' '.join(query.split())
        self.queries.append((normalized_query, params))
        if normalized_query.startswith('INSERT INTO saved_numerology_profiles'):
            return FakeCursor(
                ['id', 'profile_name', 'birth_date', 'number_system', 'created_at'],
                (self.profile_id, params[2], params[3], params[4], datetime(2026, 1, 1, tzinfo=timezone.utc)),
            )
        if normalized_query.startswith('SELECT id, profile_name'):
            rows = [(
                self.profile_id,
                self.profile['name'],
                self.profile['dateOfBirth'],
                self.profile['numberSystem'],
                datetime(2026, 1, 1, tzinfo=timezone.utc),
            )] if params[0] == self.user_id else []
            return FakeCursor(['id', 'profile_name', 'birth_date', 'number_system', 'created_at'], rows=rows)
        if normalized_query.startswith('SELECT profile_state'):
            row = (self.profile,) if params[1] == self.user_id and params[0] == self.profile_id else None
            return FakeCursor(['profile_state'], row)
        if normalized_query.startswith('DELETE FROM saved_numerology_profiles'):
            row = (self.profile_id,) if params[1] == self.user_id and params[0] == self.profile_id else None
            return FakeCursor(['id'], row)
        return FakeCursor([])


class SavedNumerologyApiTests(unittest.TestCase):
    def setUp(self):
        self.user = {'id': 42}
        self.profile = {
            'name': 'Ada Lovelace',
            'dateOfBirth': '1815-12-10',
            'numberSystem': 'chaldean',
            'numbers': {
                'mulank': 1,
                'bhagyank': 1,
                'nameNumber': {'total': 39, 'number': 3},
                'soulUrge': {'total': 20, 'number': 2},
                'personalYear': {'year': 2026, 'number': 5},
            },
        }

    def invoke(self, payload=None, user=None, connection=None, method='POST', profile_id=None):
        path = f'/api/saved-numerology/{profile_id}' if profile_id else '/api/saved-numerology'
        with patch('app.get_saved_charts_user', return_value=user):
            with patch('app.get_saved_charts_connection', return_value=connection):
                with app.app.test_request_context(
                    path, method=method, json=payload,
                    headers={'Authorization': 'Bearer test-token'},
                ):
                    result = (
                        app.saved_numerology_detail_api(str(profile_id))
                        if profile_id else app.saved_numerology_api()
                    )
        response, status = result if isinstance(result, tuple) else (result, 200)
        return response.get_json(), status

    def test_save_persists_profile_for_authenticated_user(self):
        connection = FakeSavedNumerologyConnection()
        data, status = self.invoke({'profile': self.profile}, self.user, connection)

        self.assertEqual(status, 201)
        self.assertTrue(connection.committed)
        insert_query, params = next(
            query for query in connection.queries
            if query[0].startswith('INSERT INTO saved_numerology_profiles')
        )
        self.assertIn('user_id', insert_query)
        self.assertEqual(params[1], self.user['id'])
        self.assertEqual(json.loads(params[5]), self.profile)
        self.assertEqual(data['profile']['name'], 'Ada Lovelace')
        self.assertEqual(data['profile']['number_system'], 'chaldean')

    def test_save_requires_authenticated_user(self):
        data, status = self.invoke({'profile': self.profile})

        self.assertEqual(status, 401)
        self.assertFalse(data['success'])

    def test_save_rejects_invalid_system_before_database_access(self):
        connection = FakeSavedNumerologyConnection()
        invalid_profile = {**self.profile, 'numberSystem': 'unknown'}
        data, status = self.invoke({'profile': invalid_profile}, self.user, connection)

        self.assertEqual(status, 400)
        self.assertFalse(connection.queries)

    def test_list_returns_authenticated_users_profiles(self):
        connection = FakeSavedNumerologyConnection(self.user['id'], self.profile)
        data, status = self.invoke(user=self.user, connection=connection, method='GET')

        self.assertEqual(status, 200)
        self.assertEqual(len(data['profiles']), 1)
        self.assertEqual(data['profiles'][0]['name'], 'Ada Lovelace')
        self.assertEqual(connection.queries[-1][1], (self.user['id'],))

    def test_profile_detail_is_scoped_to_owner(self):
        connection = FakeSavedNumerologyConnection(99, self.profile)
        data, status = self.invoke(
            user=self.user,
            connection=connection,
            method='GET',
            profile_id=connection.profile_id,
        )

        self.assertEqual(status, 404)
        self.assertFalse(data['success'])

    def test_owner_can_open_saved_profile(self):
        connection = FakeSavedNumerologyConnection(self.user['id'], self.profile)
        data, status = self.invoke(
            user=self.user,
            connection=connection,
            method='GET',
            profile_id=connection.profile_id,
        )

        self.assertEqual(status, 200)
        self.assertEqual(data['profile'], self.profile)

    def test_owner_can_delete_saved_profile(self):
        connection = FakeSavedNumerologyConnection(self.user['id'], self.profile)
        data, status = self.invoke(
            user=self.user,
            connection=connection,
            method='DELETE',
            profile_id=connection.profile_id,
        )

        self.assertEqual(status, 200)
        self.assertTrue(data['success'])


if __name__ == '__main__':
    unittest.main()