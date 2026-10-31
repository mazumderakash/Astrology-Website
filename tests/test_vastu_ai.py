import io
import json
import os
import unittest
from unittest.mock import Mock, patch

import app


class VastuAiApiTests(unittest.TestCase):
    def setUp(self):
        app.app.config['TESTING'] = True
        app._VASTU_REQUESTS.clear()
        self.api_key = patch.dict(os.environ, {'OPENAI_API_KEY': 'test-key'})
        self.api_key.start()
        self.addCleanup(self.api_key.stop)

    def tearDown(self):
        app._VASTU_REQUESTS.clear()

    @staticmethod
    def model_response(payload, status=200):
        response = Mock()
        response.status_code = status
        response.json.return_value = {
            'choices': [{'message': {'content': json.dumps(payload)}}],
        }
        return response

    @staticmethod
    def valid_analysis():
        grid = ['unmarked'] * 81
        grid[40] = 'kitchen'
        return {
            'orientation': {'north_at_top': 'north', 'confidence': 0.9, 'evidence': 'North arrow visible.'},
            'entrance': {'facing_direction': 'east', 'edge': 'right', 'confidence': 0.7, 'evidence': 'Door symbol at east edge.'},
            'grid': grid,
            'rooms': [{
                'name': 'Kitchen', 'zone': 'center', 'confidence': 0.8,
                'evidence': 'Kitchen label visible near center.',
                'observation': 'Central kitchen placement merits a traditional review.',
                'classical_basis': 'Traditional Mandala interpretation.',
                'recommendation': 'Consider non-structural use and layout options first.',
            }],
            'brahmasthan': {
                'observation': 'Kitchen appears in one central cell.',
                'confidence': 0.75,
                'occupied_uses': ['kitchen'],
            },
            'findings': [{
                'severity': 'moderate', 'title': 'Kitchen overlaps the center zone',
                'area': 'Kitchen', 'observation': 'One central grid cell appears occupied.',
                'classical_basis': 'Traditional Brahmasthan review point.', 'confidence': 0.75,
                'rectification': 'Consider reversible changes to use or furniture; do not alter structure on this report alone.',
            }],
            'overall_assessment': 'Preliminary traditional reading.',
            'limitations': ['Room labels are small.'],
            'references': ['Mayamata; broad interpretive reference only.'],
        }

    @staticmethod
    def invoke(data, headers=None):
        with app.app.test_request_context(
            '/api/vastu/analyze',
            method='POST',
            data=data,
            headers=headers or {},
        ):
            return app.vastu_analyze_api()

    def post_image(self, image_bytes=b'\x89PNG\r\n\x1a\nexample-image-data'):
        return self.invoke(
            {
                'floorPlan': (io.BytesIO(image_bytes), 'plan.png', 'image/png'),
                'propertyType': 'home',
                'location': 'Test City',
                'facing': 'unknown',
                'room': 'whole property',
            }
        )

    @patch('app.requests.post')
    def test_analyzes_uploaded_image_and_normalizes_ai_result(self, post):
        post.return_value = self.model_response(self.valid_analysis())

        response = self.post_image()

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertTrue(body['success'])
        self.assertEqual(len(body['analysis']['grid']), 81)
        self.assertEqual(body['analysis']['grid'][40], 'kitchen')
        self.assertEqual(body['analysis']['orientation']['north_at_top'], 'north')
        self.assertEqual(body['analysis']['findings'][0]['severity'], 'moderate')
        self.assertEqual(post.call_args.args[0], app.OPENAI_CHAT_COMPLETIONS_URL)
        self.assertEqual(post.call_args.kwargs['headers']['Authorization'], 'Bearer test-key')
        self.assertEqual(post.call_args.kwargs['json']['model'], 'gpt-4o-mini')
        image_content = post.call_args.kwargs['json']['messages'][1]['content'][1]['image_url']['url']
        self.assertTrue(image_content.startswith('data:image/png;base64,'))

    @patch.dict(os.environ, {'OPENAI_API_KEY': ''})
    @patch('app.requests.post')
    def test_reports_missing_server_key_without_provider_call(self, post):
        response = self.post_image()

        self.assertEqual(response.status_code, 503)
        self.assertIn('OPENAI_API_KEY', response.get_json()['error'])
        post.assert_not_called()

    @patch('app.requests.post')
    def test_rejects_non_image_upload_before_provider_call(self, post):
        response = self.post_image(b'%PDF-1.7 not-an-image')

        self.assertEqual(response.status_code, 400)
        self.assertIn('PDF', response.get_json()['error'])
        post.assert_not_called()

    @patch('app.requests.post')
    def test_returns_local_development_cors_header(self, post):
        post.return_value = self.model_response(self.valid_analysis())

        response = self.invoke(
            {
                'floorPlan': (io.BytesIO(b'\x89PNG\r\n\x1a\nexample-image-data'), 'plan.png', 'image/png'),
            },
            headers={'Origin': 'http://localhost:3000'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Access-Control-Allow-Origin'], 'http://localhost:3000')


if __name__ == '__main__':
    unittest.main()
