
import json
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Signin


def json_error(message, status=400):
    return JsonResponse(
        {
            "success": False,
            "message": message,
        },
        status=status,
    )


def parse_json_body(request):
    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, json_error("Invalid JSON payload.")

    if not isinstance(payload, dict):
        return None, json_error("JSON payload must be an object.")

    return payload, None

@csrf_exempt
def signin(request):

    print("--------------------------SIGNIN--------------------------")
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method not allowed."},
            status=405,
        )

    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"message": "Invalid JSON payload."},
            status=400,
        )

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not name or not email or not password:
        return JsonResponse(
            {"message": "Name, email and password are required."},
            status=400,
        )

    if Signin.objects.filter(email__iexact=email).exists():
        return JsonResponse(
            {"message": "An account with this email already exists."},
            status=409,
        )

    Signin.objects.create(
        name=name,
        email=email,
        password=make_password(password),
    )

    return JsonResponse(
        {"message": "Account created successfully."},
        status=201,
    )


@csrf_exempt
def login(request):
    if request.method != "POST":
        return json_error("Method not allowed.", 405)

    payload, error = parse_json_body(request)

    if error:
        return error

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not isinstance(password, str):
        return json_error("Invalid password.")

    if not email or not password:
        return json_error(
            "Email and password are required."
        )

    # Find the user by email.
    user = Signin.objects.filter(
        email__iexact=email
    ).first()

    # Verify the hashed password.
    if (
        user is None
        or not user.password
        or not check_password(password, user.password)
    ):
        return json_error(
            "Invalid email or password.",
            401,
        )

    # Generate a cryptographically random 6-digit OTP.
    otp = str(secrets.randbelow(900000) + 100000)

    expiry_time = timezone.now() + timedelta(minutes=5)

    # Store OTP and expiry in the database.
    user.otp = otp
    user.otp_sessionTime = expiry_time
    user.save(
        update_fields=["otp", "otp_sessionTime"]
    )

    # Send OTP through configured SMTP.
    try:
        send_mail(
            subject="Your Login Verification Code",
            message=(
                f"Your OTP is {otp}.\n\n"
                "This code expires in 5 minutes. "
                "Do not share it with anyone."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    except Exception:
        # Clear OTP if email delivery fails.
        user.otp = None
        user.otp_sessionTime = None
        user.save(
            update_fields=["otp", "otp_sessionTime"]
        )

        # Log the actual error server-side if needed.
        import logging
        logging.getLogger(__name__).exception(
            "Failed to send login OTP."
        )

        return json_error(
            "Unable to send OTP. Please try again.",
            500,
        )

    return JsonResponse(
        {
            "success": True,
            "message": "OTP sent successfully.",
            "user_id": user.pk,
            "email": user.email,
            "otp_sessionTime": expiry_time.isoformat(),
        },
        status=200,
    )


@csrf_exempt
def verify_otp(request):
    if request.method != "POST":
        return json_error("Method not allowed.", 405)

    payload, error = parse_json_body(request)

    if error:
        return error

    user_id = payload.get("user_id")
    otp = str(payload.get("otp") or "").strip()

    if user_id is None or not otp:
        return json_error(
            "User ID and OTP are required."
        )

    # Accept only a six-digit OTP.
    if len(otp) != 6 or not otp.isdigit():
        return json_error("Invalid OTP.")

    try:
        user = Signin.objects.get(pk=user_id)
    except (Signin.DoesNotExist, ValueError, TypeError):
        return json_error(
            "Invalid login challenge.",
            400,
        )

    # Check whether an active OTP exists.
    if not user.otp or not user.otp_sessionTime:
        return json_error(
            "No active OTP. Please log in again."
        )

    # Check OTP expiry.
    if timezone.now() >= user.otp_sessionTime:
        user.otp = None
        user.otp_sessionTime = None
        user.save(
            update_fields=["otp", "otp_sessionTime"]
        )

        return json_error(
            "OTP expired. Please log in again."
        )

    # Constant-time OTP comparison.
    if not secrets.compare_digest(
        str(user.otp), otp
    ):
        return json_error("Invalid OTP.", 400)

    # OTP is correct. Consume it before issuing tokens.
    user.otp = None
    user.otp_sessionTime = None
    user.save(
        update_fields=["otp", "otp_sessionTime"]
    )

    is_admin = user.email.lower() == "admin@gmail.com"

    # Generate JWT refresh and access tokens.
    refresh = RefreshToken.for_user(user)

    # Add custom claims to the refresh token.
    refresh["email"] = user.email
    refresh["is_admin"] = is_admin

    # Access token inherits applicable custom claims.
    access = refresh.access_token

    return JsonResponse(
        {
            "success": True,
            "message": "Login successful.",
            "user_id": user.pk,
            "email": user.email,
            "is_admin": is_admin,
            "token_type": "Bearer",
            "access": str(access),
            "refresh": str(refresh),
            "redirect": (
                "/dashboard" if is_admin else "/home"
            ),
        },
        status=200,
    )


@csrf_exempt
def test_email(request):
    if request.method != "POST":
        return json_error("Method not allowed.", 405)

    payload, error = parse_json_body(request)

    if error:
        return error

    recipient = (
        payload.get("email") or ""
    ).strip()

    if not recipient or "@" not in recipient:
        return json_error(
            "Provide a valid recipient email."
        )

    try:
        result = send_mail(
            subject="SMTP Connection Test",
            message=(
                "Django SMTP connection successful!"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

        return JsonResponse(
            {
                "success": result == 1,
                "emails_sent": result,
            },
            status=200 if result == 1 else 500,
        )

    except Exception:
        import logging
        logging.getLogger(__name__).exception(
            "SMTP connection test failed."
        )

        return json_error(
            "Unable to send test email. "
            "Check your SMTP configuration.",
            500,
        )