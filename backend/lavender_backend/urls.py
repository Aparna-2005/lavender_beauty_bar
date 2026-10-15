from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AppointmentCreateView

urlpatterns = [
    path("signin", views.signin, name="signin"),
    path("login", views.login, name="login"),
    path("verify-otp", views.verify_otp, name="verify_otp"),
    path("test-email", views.test_email, name="test_email"),
    path( "api/token/refresh/", TokenRefreshView.as_view(),  name="token_refresh"),

    path("appointments/", AppointmentCreateView.as_view(), name="appointment-create"),
]