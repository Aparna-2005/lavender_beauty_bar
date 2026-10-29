from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import User


from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Signin(AbstractBaseUser):
    Inactive = "0"
    Active = "1"
    Delete = "2"
    STATUS = [
    ("0", "Inactive"),
    ("1", "Active"),
    ("2", "Deleted"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="login", null=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255,null=True)
    last_login = models.DateTimeField(null=True)
    otp = models.IntegerField(null=True)
    otp_sessionTime = models.DateTimeField(null=True)
    status = models.CharField(max_length=2,choices=STATUS,default=Active)
    created_at = models.DateTimeField(default=timezone.now )
    updated_at = models.DateTimeField(auto_now=True )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = BaseUserManager()

    def __str__(self):
        return self.user.id


class Appointment(models.Model):
    SERVICE_CHOICES = [
        ("Facial & Skin Care", "Facial & Skin Care"),
        ("Hair Care & Styling", "Hair Care & Styling"),
        ("Bridal Makeup", "Bridal Makeup"),
        ("Makeup & Glamour", "Makeup & Glamour"),
        ("Manicure & Pedicure", "Manicure & Pedicure"),
        ("Waxing & Threading", "Waxing & Threading"),
        ("Hair Colouring", "Hair Colouring"),
        ("Spa & Relaxation", "Spa & Relaxation"),
        ("Saree Pleating", "Saree Pleating"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    service = models.CharField(max_length=100, choices=SERVICE_CHOICES)
    date = models.DateField()
    time = models.TimeField()
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        # same date + time-la rendu booking varama irukka
        constraints = [
            models.UniqueConstraint(
                fields=["date", "time"],
                condition=~models.Q(status="Cancelled"),
                name="unique_active_slot",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.service} ({self.date} {self.time})"


class Services(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image= models.ImageField(upload_to="services/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Courses(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name