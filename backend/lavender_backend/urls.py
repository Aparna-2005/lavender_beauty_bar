from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("signin", views.signin, name="signin"),
    path("login", views.login, name="login"),
    path("verify-otp", views.verify_otp, name="verify_otp"),
    path("test-email", views.test_email, name="test_email"),
    path( "api/token/refresh/", TokenRefreshView.as_view(),  name="token_refresh"),
]