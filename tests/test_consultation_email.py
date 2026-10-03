import os
import unittest
from unittest.mock import patch

import app


class MockSMTP:
    instances = []

    def __init__(self, host, port, timeout=None):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.message = None
        self.login_details = None
        self.__class__.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def ehlo(self):
        return None

    def starttls(self, context=None):
        return None

    def login(self, username, password):
        self.login_details = (username, password)

    def send_message(self, message):
        self.message = message


class ConsultationEmailTests(unittest.TestCase):
    def setUp(self):
        MockSMTP.instances.clear()
        self.payload = {
            'name': 'Example Client',
            'email': 'client@example.com',
            'phone': '+1 555 0100',
            'type': 'Career',
            'message': 'Please contact me about career guidance.',
        }

    def invoke_route(self, payload):
        with app.app.test_request_context('/api/consultation', method='POST', json=payload):
            result = app.consultation_api()
            response, status = result if isinstance(result, tuple) else (result, 200)
            return response.get_json(), status

    def test_invalid_email_is_rejected_without_smtp(self):
        self.payload['email'] = 'not-an-email'
        data, status = self.invoke_route(self.payload)
        self.assertEqual(status, 400)
        self.assertFalse(data['success'])
        self.assertEqual(MockSMTP.instances, [])

    def test_missing_smtp_configuration_does_not_claim_success(self):
        empty_settings = {
            'SMTP_HOST': '',
            'SMTP_USERNAME': '',
            'SMTP_PASSWORD': '',
            'SMTP_FROM_EMAIL': '',
            'SMTP_PORT': '587',
        }
        with patch.dict(os.environ, empty_settings, clear=False):
            data, status = self.invoke_route(self.payload)
        self.assertEqual(status, 503)
        self.assertFalse(data['success'])
        self.assertEqual(MockSMTP.instances, [])

    def test_submission_emails_fixed_recipient_and_all_request_details(self):
        smtp_settings = {
            'SMTP_HOST': 'smtp.example.com',
            'SMTP_PORT': '587',
            'SMTP_USERNAME': 'sender@example.com',
            'SMTP_PASSWORD': 'test-app-password',
            'SMTP_FROM_EMAIL': 'sender@example.com',
        }
        with patch.dict(os.environ, smtp_settings, clear=False):
            with patch('app.smtplib.SMTP', MockSMTP):
                data, status = self.invoke_route(self.payload)

        self.assertEqual(status, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(MockSMTP.instances), 1)
        sent_message = MockSMTP.instances[0].message
        self.assertEqual(sent_message['To'], 'runmyastro@gmail.com')
        self.assertEqual(sent_message['Reply-To'], 'client@example.com')
        self.assertIn('Example Client', sent_message.get_content())
        self.assertIn('career guidance', sent_message.get_content())


if __name__ == '__main__':
    unittest.main()