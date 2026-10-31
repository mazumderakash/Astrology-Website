import unittest
import tempfile
from datetime import datetime, timedelta
from unittest.mock import patch

import app


class FakeDatabase:
    def __init__(self):
        self.query = None
        self.params = None
        self.committed = False

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception, traceback):
        return False

    def execute(self, query, params):
        self.query = ' '.join(query.split())
        self.params = params

    def commit(self):
        self.committed = True


class LogoutApiTests(unittest.TestCase):
    def invoke_logout(self, token, user):
        headers = {'Authorization': f'Bearer {token}'} if token else {}
        with patch('app.get_user_from_token', return_value=user):
            with app.app.test_request_context('/api/logout', method='POST', headers=headers):
                result = app.logout()
        response, status = result if isinstance(result, tuple) else (result, 200)
        return response.get_json(), status

    def test_logout_rejects_invalid_session(self):
        data, status = self.invoke_logout('invalid-token', None)

        self.assertEqual(status, 401)
        self.assertFalse(data['success'])

    def test_logout_deletes_only_the_current_users_session(self):
        database = FakeDatabase()
        with patch('app.get_user_from_token', return_value={'id': 17}):
            with patch('app.get_db', return_value=database):
                with app.app.test_request_context(
                    '/api/logout',
                    method='POST',
                    headers={'Authorization': 'Bearer active-token'},
                ):
                    response = app.logout()

        self.assertTrue(response.get_json()['success'])
        self.assertTrue(database.committed)
        self.assertEqual(database.query, 'DELETE FROM sessions WHERE token = ? AND user_id = ?')
        self.assertEqual(database.params, ('active-token', 17))


class PasswordAuthApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path_patcher = patch('app.DB_PATH', f'{self.temp_dir.name}/auth-test.db')
        self.database_path_patcher.start()
        app.init_db()

    def tearDown(self):
        self.database_path_patcher.stop()
        self.temp_dir.cleanup()

    def invoke(self, view, path, payload):
        with app.app.test_request_context(path, method='POST', json=payload):
            result = view()
        response, status = result if isinstance(result, tuple) else (result, 200)
        return response.get_json(), status

    def send_code(self, purpose, phone='15551234567'):
        with patch('app.generate_otp', return_value='123456'), patch('app.deliver_auth_otp', return_value=True):
            data, status = self.invoke(app.send_otp, '/api/send-otp', {'phone': phone, 'purpose': purpose})
        self.assertEqual(status, 200)
        self.assertTrue(data['success'])
        return phone

    def verify_code(self, purpose, phone):
        data, status = self.invoke(
            app.verify_auth_otp,
            '/api/verify-otp',
            {'phone': phone, 'otp': '123456', 'purpose': purpose},
        )
        self.assertEqual(status, 200)
        self.assertTrue(data['success'])
        return data['verification_token']

    def test_registration_password_login_and_password_reset(self):
        with app.get_db() as conn:
            conn.execute(
                'INSERT INTO users (full_name, phone, password_hash) VALUES (?, ?, ?)',
                ('Legacy User', '+15550001111', app.generate_password_hash('legacy-pass-123')),
            )

        phone = self.send_code('register')
        registration_token = self.verify_code('register', phone)
        data, status = self.invoke(app.register, '/api/register', {
            'full_name': 'Test User',
            'email': 'test.user@example.com',
            'phone': phone,
            'password': 'initial-pass-123',
            'verification_token': registration_token,
        })
        self.assertEqual(status, 200)
        self.assertTrue(data['success'])

        invalid_login, status = self.invoke(app.login, '/api/login', {'phone': phone, 'password': 'wrong-pass'})
        self.assertEqual(status, 401)
        self.assertFalse(invalid_login['success'])
        valid_login, status = self.invoke(app.login, '/api/login', {'phone': phone, 'password': 'initial-pass-123'})
        self.assertEqual(status, 200)
        self.assertTrue(valid_login['success'])
        self.assertEqual(valid_login['user']['id'], data['user']['id'])
        remembered_login, status = self.invoke(app.login, '/api/login', {
            'identifier': 'test.user@example.com',
            'password': 'initial-pass-123',
            'remember_me': True,
        })
        self.assertEqual(status, 200)
        with app.get_db() as conn:
            expiry = conn.execute('SELECT expires_at FROM sessions ORDER BY id DESC LIMIT 1').fetchone()[0]
        self.assertGreater(datetime.strptime(expiry, '%Y-%m-%dT%H:%M:%S'), datetime.utcnow() + timedelta(days=29))

        self.send_code('password_reset', phone)
        reset_token = self.verify_code('password_reset', phone)
        reset, status = self.invoke(app.reset_password, '/api/reset-password', {
            'phone': phone,
            'password': 'replacement-pass-456',
            'verification_token': reset_token,
        })
        self.assertEqual(status, 200)
        self.assertTrue(reset['success'])
        with app.get_db() as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM sessions').fetchone()[0], 0)

        old_login, status = self.invoke(app.login, '/api/login', {'phone': phone, 'password': 'initial-pass-123'})
        self.assertEqual(status, 401)
        new_login, status = self.invoke(app.login, '/api/login', {'phone': phone, 'password': 'replacement-pass-456'})
        self.assertEqual(status, 200)
        self.assertTrue(new_login['success'])

    def test_registration_otp_is_one_time_and_purpose_bound(self):
        phone = self.send_code('register')
        wrong_purpose, status = self.invoke(app.verify_auth_otp, '/api/verify-otp', {
            'phone': phone,
            'otp': '123456',
            'purpose': 'password_reset',
        })
        self.assertEqual(status, 400)
        self.assertFalse(wrong_purpose['success'])

        token = self.verify_code('register', phone)
        data, status = self.invoke(app.register, '/api/register', {
            'full_name': 'Test User',
            'email': 'test.user@example.com',
            'phone': phone,
            'password': 'initial-pass-123',
            'verification_token': token,
        })
        self.assertEqual(status, 200)
        repeated, status = self.invoke(app.register, '/api/register', {
            'full_name': 'Test User',
            'email': 'test.user@example.com',
            'phone': phone,
            'password': 'another-pass-123',
            'verification_token': token,
        })
        self.assertEqual(status, 400)
        self.assertFalse(repeated['success'])

    def test_google_login_verifies_audience_and_creates_account(self):
        class GoogleResponse:
            status_code = 200

            def json(self):
                return {
                    'aud': 'test-client-id',
                    'iss': 'https://accounts.google.com',
                    'email_verified': 'true',
                    'email': 'google.user@example.com',
                    'name': 'Google User',
                }

        with patch.dict('os.environ', {'GOOGLE_CLIENT_ID': 'test-client-id'}):
            with patch('app.requests.get', return_value=GoogleResponse()):
                data, status = self.invoke(app.google_login, '/api/google-login', {'credential': 'signed-test-token'})
        self.assertEqual(status, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['email'], 'google.user@example.com')

        class WrongAudienceResponse(GoogleResponse):
            def json(self):
                claims = super().json()
                claims['aud'] = 'another-client'
                return claims

        with patch.dict('os.environ', {'GOOGLE_CLIENT_ID': 'test-client-id'}):
            with patch('app.requests.get', return_value=WrongAudienceResponse()):
                rejected, status = self.invoke(app.google_login, '/api/google-login', {'credential': 'signed-test-token'})
        self.assertEqual(status, 401)
        self.assertFalse(rejected['success'])

    def test_whatsapp_otp_creates_account_and_signs_in_existing_user(self):
        phone = '+919876543210'
        with patch('app.generate_otp', return_value='123456'), patch('app.deliver_auth_otp', return_value=True) as deliver:
            sent, status = self.invoke(app.send_otp, '/api/send-otp', {'phone': phone, 'purpose': 'auth'})
        self.assertEqual(status, 200)
        self.assertTrue(sent['success'])
        deliver.assert_called_once_with(phone, '123456', 'whatsapp')

        verification_token = self.verify_code('auth', phone)
        created, status = self.invoke(app.complete_auth, '/api/complete-auth', {
            'phone': phone,
            'verification_token': verification_token,
        })
        self.assertEqual(status, 200)
        self.assertTrue(created['success'])
        self.assertEqual(created['user']['phone'], phone)

        self.send_code('auth', phone)
        verification_token = self.verify_code('auth', phone)
        signed_in, status = self.invoke(app.complete_auth, '/api/complete-auth', {
            'phone': phone,
            'verification_token': verification_token,
        })
        self.assertEqual(status, 200)
        self.assertEqual(signed_in['user']['id'], created['user']['id'])
        with app.get_db() as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM users').fetchone()[0], 1)

        repeated, status = self.invoke(app.complete_auth, '/api/complete-auth', {
            'phone': phone,
            'verification_token': verification_token,
        })
        self.assertEqual(status, 400)
        self.assertFalse(repeated['success'])


if __name__ == '__main__':
    unittest.main()
