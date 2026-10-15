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