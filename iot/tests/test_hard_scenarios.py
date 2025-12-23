import json
from unittest.mock import Mock, patch

import requests
from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from iot.models import (IoTData, QuizQuestion, QuizResult, QuizResultMessage,
                        SystemSetting)


class HardScenarioTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password123")  # nosec B106

        # Seed minimal Quiz Data
        self.q1 = QuizQuestion.objects.create(
            question="Q1",
            options=["A", "B", "C", "D"],
            correct_answer=0,
            order=1,
            reactions_correct=["Yay"],
            reactions_wrong=["Nay"],
            fun_fact="Fact1",
        )
        self.q2 = QuizQuestion.objects.create(
            question="Q2",
            options=["A", "B", "C", "D"],
            correct_answer=1,
            order=2,
            reactions_correct=["Yay"],
            reactions_wrong=["Nay"],
            fun_fact="Fact2",
        )

        # Seed Result Message
        QuizResultMessage.objects.create(
            min_percentage=0, title="Bad", message="Try again", emoji=":(", color_class="danger", badge_text="Fail"
        )
        QuizResultMessage.objects.create(
            min_percentage=100, title="Perfect", message="Good job", emoji=":)", color_class="success", badge_text="Win"
        )

    # ==================== QUIZ HARD TESTS ====================

    def test_quiz_perfect_score_authenticated(self):
        """Test perfect score calculation and DB saving for logged-in user"""
        self.client.login(username="testuser", password="password123")  # nosec B106

        payload = {"answers": [0, 1]}  # Correct answers for Q1(0) and Q2(1)
        response = self.client.post(reverse("api_quiz_submit"), data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["score"], 2)
        self.assertEqual(data["percentage"], 100.0)

        # Verify DB integrity
        result = QuizResult.objects.first()
        self.assertIsNotNone(result)
        self.assertEqual(result.user, self.user)
        self.assertEqual(result.score, 2)

    def test_quiz_partial_answers(self):
        """Test submission with fewer answers than questions"""
        payload = {"answers": [0]}  # Only answered Q1
        response = self.client.post(reverse("api_quiz_submit"), data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["score"], 1)  # 1 correct out of 2 total
        self.assertEqual(data["percentage"], 50.0)

    def test_quiz_excessive_answers(self):
        """Test submission with MORE answers than questions (attack vector?)"""
        payload = {"answers": [0, 1, 0, 0, 0]}  # 5 answers for 2 questions
        response = self.client.post(reverse("api_quiz_submit"), data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["score"], 2)  # Should ignore extra answers and not crash
        self.assertEqual(data["total"], 2)

    def test_quiz_invalid_payload(self):
        """Test malformed JSON"""
        response = self.client.post(reverse("api_quiz_submit"), data="Not valid json", content_type="application/json")
        self.assertEqual(response.status_code, 400)

    # ==================== CHATBOT PROXY HARD TESTS ====================

    # We used side_effect on the mocked object logic below
    @patch("iot.views.api_views.requests.post")
    def test_chatbot_proxy_connection_error(self, mock_post):
        """Test graceful handling of downstream absolute failure"""
        mock_post.side_effect = requests.exceptions.ConnectionError("Connection refused")

        response = self.client.post(
            reverse("api_chatbot_proxy"), data=json.dumps({"message": "hello"}), content_type="application/json"
        )

        self.assertEqual(response.status_code, 503)
        self.assertIn("La connexion au service IA a échoué", response.json()["error"])

    @patch("iot.views.api_views.requests.post")
    def test_chatbot_proxy_timeout(self, mock_post):
        """Test graceful handling of timeout"""
        mock_post.side_effect = requests.exceptions.Timeout("Read timeout")

        response = self.client.post(
            reverse("api_chatbot_proxy"), data=json.dumps({"message": "hello"}), content_type="application/json"
        )

        self.assertEqual(response.status_code, 500)  # Generic exception in view caught as 500

    @patch("iot.views.api_views.requests.post")
    def test_chatbot_proxy_dynamic_url(self, mock_post):
        """Test that the proxy uses the URL from SystemSettings if present"""
        SystemSetting.objects.create(key="chatbot_url", value="http://custom-ai.local/api")

        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {"reply": "Custom AI"}
        mock_post.return_value = mock_response

        self.client.post(reverse("api_chatbot_proxy"), data=json.dumps({"message": "hello"}), content_type="application/json")

        # Verify calls
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], "http://custom-ai.local/api")

    # ==================== IOT DATA INGESTION HARD TESTS ====================

    def test_data_ingestion_partial_payload(self):
        """Test ingestion with missing nested keys (Node-RED sometimes sends partials)"""
        # Payload missing 'scores' and 'network'
        payload = {"hardware": {"sensor_id": "TEST", "cpu": 50}, "energy": {"power": 100}}

        response = self.client.post(reverse("iot_data_post"), data=json.dumps(payload), content_type="application/json")

        self.assertEqual(response.status_code, 201)

        # Verify defaults were applied
        latest = IoTData.objects.last()
        self.assertEqual(latest.hardware_sensor_id, "TEST")
        self.assertEqual(latest.eco_score, 0)  # Default
