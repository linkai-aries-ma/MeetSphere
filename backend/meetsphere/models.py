from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    username = None
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profile_images', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']


class Calendar(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateField()
    end_date = models.DateField()
    availability = models.JSONField()
    owner = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='calendar')


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    profile_image = models.ImageField(upload_to='profile_images', null=True, blank=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='contacts')


class Meeting(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(default='')
    is_virtual = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    if is_virtual:
        location = models.TextField(default='')
    else:
        location = models.TextField(max_length=100)

    # People
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name='meetings')
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='meetings')
    invitee = models.ForeignKey(Contact, related_name='meetings', on_delete=models.CASCADE)

    # Time
    start_time = models.DateTimeField()
    duration = models.DurationField()
