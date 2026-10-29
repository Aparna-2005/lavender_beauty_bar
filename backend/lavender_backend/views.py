
import json
import logging
import secrets
import os
import traceback

from datetime import timedelta
from django.views.decorators.http import require_POST,require_GET
from django.core.files.storage import FileSystemStorage

from django.conf import settings
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .models import *
from .serializers import AppointmentSerializer


from datetime import date

from django.db import DatabaseError,IntegrityError

from .models import Courses, CourseEnquiry



logger = logging.getLogger(__name__)


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
        payload = json.loads(request.body or "{}")

        if not isinstance(payload, dict):
            return None, json_error("Invalid request data.")

        return payload, None

    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, json_error("Invalid JSON data.")


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

    print("--------------------------LOGIN------------------------")

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

    # --------------------------------------------------
    # STEP 1: CHECK DJANGO ADMIN / STAFF USER
    # --------------------------------------------------

    admin_user = User.objects.filter(
        Q(is_staff=True) | Q(is_superuser=True),
        email__iexact=email,
        is_active=True,
    ).first()

    # Avoid printing passwords or other sensitive data.
    print("Admin account found:", admin_user is not None)

    if admin_user is not None:

        # Authenticate using Django's configured backend.
        authenticated_user = authenticate(
            request,
            username=admin_user.username,
            password=password,
        )

        if (
            authenticated_user is None
            or authenticated_user.pk != admin_user.pk
        ):
            return json_error(
                "Invalid email or password.",
                401,
            )

        # Admin login without OTP.
        django_login(request, authenticated_user)

        return JsonResponse(
            {
                "success": True,
                "role": "admin",
                "message": "Admin login successful.",
                "user_id": authenticated_user.pk,
                "username": authenticated_user.username,
                "email": authenticated_user.email,
                "redirect_url": "/dashboard",
                "superuser": authenticated_user.is_superuser,
            },
            status=200,
        )

    # --------------------------------------------------
    # STEP 2: CHECK NORMAL USER IN SIGNIN TABLE
    # --------------------------------------------------

    user = Signin.objects.filter(
        email__iexact=email
    ).first()

    print("Normal user account found:", user is not None)

    if user is None:
        return json_error(
            "Invalid email or password.",
            401,
        )

    if not user.password or not check_password(
        password,
        user.password,
    ):
        return json_error(
            "Invalid email or password.",
            401,
        )

    # Status: 0 = Inactive, 1 = Active, 2 = Deleted.
    if str(user.status) != "1":
        return json_error(
            "Your account is inactive. Please contact the administrator.",
            403,
        )

    # --------------------------------------------------
    # STEP 3: GENERATE OTP FOR NORMAL USERS ONLY
    # --------------------------------------------------

    otp = str(secrets.randbelow(900000) + 100000)

    expiry_time = timezone.now() + timedelta(minutes=5)

    user.otp = otp
    user.otp_sessionTime = expiry_time

    user.save(
        update_fields=[
            "otp",
            "otp_sessionTime",
        ]
    )

    # --------------------------------------------------
    # STEP 4: SEND OTP EMAIL
    # --------------------------------------------------

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
        user.otp = None
        user.otp_sessionTime = None

        user.save(
            update_fields=[
                "otp",
                "otp_sessionTime",
            ]
        )

        logger.exception("Failed to send login OTP.")

        return json_error(
            "Unable to send OTP. Please try again.",
            500,
        )

    # --------------------------------------------------
    # STEP 5: RETURN OTP CHALLENGE TO FRONTEND
    # --------------------------------------------------

    return JsonResponse(
        {
            "success": True,
            "role": "user",
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


class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Appointment booked successfully!", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

# Save uploaded files to frontend/public/images/services/
SERVICE_IMAGES_DIR = settings.SERVICE_IMAGES_DIR
SERVICE_IMAGES_URL = "/images/services/"

@csrf_exempt
# @require_POST
def add_service(request):
    try:
        title = request.POST.get("title", "").strip()
        desc = request.POST.get("desc", "").strip()
        image = request.FILES.get("image")

        print("Service title:", title)
        print("Service description:", desc)
        print("Uploaded image:", image.name if image else None)

        if not title or not desc or not image:
            return JsonResponse({
                "success": False,
                "message": "Please provide service name, description, and image."
            }, status=400)

        if len(title) > 100:
            return JsonResponse({
                "success": False,
                "message": "Service name cannot exceed 100 characters."
            }, status=400)

        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        extension = os.path.splitext(image.name)[1].lower()

        if extension not in allowed_extensions:
            return JsonResponse({
                "success": False,
                "message": "Only JPG, JPEG, PNG, and WEBP images are allowed."
            }, status=400)

        if image.size > 5 * 1024 * 1024:
            return JsonResponse({
                "success": False,
                "message": "Image size must be 5 MB or less."
            }, status=400)

        os.makedirs(SERVICE_IMAGES_DIR, exist_ok=True)

        storage = FileSystemStorage(
            location=SERVICE_IMAGES_DIR,
            base_url=SERVICE_IMAGES_URL
        )

        # Avoid overwriting a file with the same name.
        saved_filename = storage.save(image.name, image)

        # IMPORTANT:
        # This assumes your model fields are name, description, image.
        service = Services.objects.create(
            name=title,
            description=desc,
            image=saved_filename
        )

        return JsonResponse({
            "success": True,
            "message": "Service added successfully.",
            "service": {
                "id": service.id,
                "title": service.name,
                "desc": service.description or "",
                "img": SERVICE_IMAGES_URL + saved_filename
            }
        }, status=201)

    except Exception as error:
        # Check the Django terminal for the actual error.
        print("ADD SERVICE ERROR:", repr(error))

        return JsonResponse({
            "success": False,
            "message": str(error)
        }, status=500)


# --------------------------------------------------
# GET: Fetch all services
# URL: /get_services
# --------------------------------------------------

@require_GET
def get_services(request):
    print("__________GET SERVICES__________")

    try:
        services = Services.objects.all().order_by("-id")
        services_list = []

        for service in services:
            image_url = ""

            if service.image:
                # Use the URL from the model's configured storage.
                image_url = f"{SERVICE_IMAGES_URL}{service.image.url if hasattr(service.image, 'url') else service.image.name}"

                # React public files should use a relative URL such as
                # /images/services/hair-spa.jpg.
                if image_url.startswith("http://") or image_url.startswith("https://"):
                    # Keep the URL if storage already returns an absolute URL.
                    pass
                elif not image_url.startswith("/"):
                    image_url = f"{SERVICE_IMAGES_URL}{image_url}"


            print("Image : ", image_url)

            services_list.append({
                "id": service.id,
                "title": service.name,
                "desc": service.description or "",
                "img": image_url,
            })

        return JsonResponse({
            "success": True,
            "services": services_list,
        }, status=200)

    except Exception as error:
        traceback.print_exc()

        return JsonResponse({
            "success": False,
            "message": f"Unable to fetch services: {str(error)}",
        }, status=500)



@require_GET
def get_courses(request):
    print("__________GET COURSES__________")

    try:
        courses = Courses.objects.all().order_by("-id")
        courses_list = []

        print("COURSES : ", courses)

        for courses in courses:
            courses_list.append({
                "id": courses.id,
                "title": courses.name,
                "desc": courses.description or "",
                "prize": courses.price,
                "duration":courses.duration
            })

        return JsonResponse({
            "success": True,
            "services": courses_list,
        }, status=200)

    except Exception as error:
        traceback.print_exc()

        return JsonResponse({
            "success": False,
            "message": f"Unable to fetch courses: {str(error)}",
        }, status=500)

@csrf_exempt
# @require_POST
def add_course(request):
    try:
        title = request.POST.get("title", "").strip()
        desc = request.POST.get("desc", "").strip()
        prize = request.POST.get("prize")
        duration = request.POST.get("duration", "").strip()

        print("Course title:", title)
        print("Course description:", desc)
        print("Course duration:", duration)
        print("Prize: ", prize)

        if not title or not desc or not prize or not duration:
            return JsonResponse({
                "success": False,
                "message": "Please provide course name, description, prize, and duration."
            }, status=400)

        if len(title) > 100:
            return JsonResponse({
                "success": False,
                "message": "Service name cannot exceed 100 characters."
            }, status=400)



        # IMPORTANT:
        # This assumes your model fields are name, description, image.
        service = Courses.objects.create(
            name=title,
            description=desc,
            price=prize,
            duration=duration
        )

        return JsonResponse({
            "success": True,
            "message": "Course added successfully.",
            "service": {
                "id": service.id,
                "title": service.name,
                "desc": service.description or "",
                "prize": service.price,
                "duration": service.duration
            }
        }, status=201)

    except Exception as error:
        # Check the Django terminal for the actual error.
        print("ADD COURSE ERROR:", repr(error))

        return JsonResponse({
            "success": False,
            "message": str(error)
        }, status=500)



@csrf_exempt
@require_POST
def course_enquiry(request):
    try:
        data = json.loads(request.body)

        # Get form data
        course_name = data.get("course_name", "").strip()
        student_name = data.get("student_name", "").strip()
        phone = data.get("phone", "").strip()
        email = data.get("email", "").strip()
        joining_date = data.get("joining_date", "").strip()
        message = data.get("message", "").strip()

        # Validate required fields
        if not all([
            course_name,
            student_name,
            phone,
            joining_date
        ]):
            return JsonResponse({
                "success": False,
                "message": "Please fill in all required fields."
            }, status=400)

        # Validate student name
        if len(student_name) > 100:
            return JsonResponse({
                "success": False,
                "message": "Student name cannot exceed 100 characters."
            }, status=400)

        # Validate phone number
        if not phone.isdigit() or len(phone) != 10:
            return JsonResponse({
                "success": False,
                "message": "Enter a valid 10-digit phone number."
            }, status=400)

        # Validate joining date
        try:
            parsed_date = date.fromisoformat(joining_date)
        except ValueError:
            return JsonResponse({
                "success": False,
                "message": "Invalid joining date."
            }, status=400)

        if parsed_date < date.today():
            return JsonResponse({
                "success": False,
                "message": "Joining date cannot be in the past."
            }, status=400)

        # Find course using the correct field: name
        try:
            course = Courses.objects.get(name=course_name)
        except Courses.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Selected course was not found."
            }, status=404)
        except Courses.MultipleObjectsReturned:
            return JsonResponse({
                "success": False,
                "message": "Multiple courses have the same name. Please contact the administrator."
            }, status=400)

        # Save enquiry
        enquiry = CourseEnquiry.objects.create(
            course_name=course,
            student_name=student_name,
            phone=phone,
            email=email or None,
            joining_date=parsed_date,
            message=message
        )

        # Return success response
        return JsonResponse({
            "success": True,
            "message": "Course enquiry submitted successfully!",
            "enquiry": {
                "id": enquiry.id,
                "course_name": course.name,
                "student_name": enquiry.student_name,
                "phone": enquiry.phone,
                "email": enquiry.email,
                "joining_date": enquiry.joining_date.isoformat(),
                "message": enquiry.message
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "message": "Invalid JSON data."
        }, status=400)

    except (DatabaseError, IntegrityError):
        return JsonResponse({
            "success": False,
            "message": "Database error while saving the enquiry."
        }, status=500)

    except Exception as error:
        return JsonResponse({
            "success": False,
            "message": f"Unable to submit enquiry: {str(error)}"
        }, status=500)

    