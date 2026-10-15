import json

from django.test import TestCase, override_settings

from .models import Signin


@override_settings(
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
)
class SigninTests(TestCase):
    def test_signin_saves_name_email_and_password(self):
        response = self.client.post(
            "/signin",
            data=json.dumps({
                "name": "Jane Doe",
                "email": "jane@example.com",
                "password": "StrongPass123",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Signin.objects.filter(email="jane@example.com").exists())

        saved_user = Signin.objects.get(email="jane@example.com")
        self.assertEqual(saved_user.name, "Jane Doe")
        self.assertNotEqual(saved_user.password, "StrongPass123")
