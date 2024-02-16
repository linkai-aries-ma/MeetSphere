from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    displayed_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'displayed_name']