import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    objects: models.Manager

    id = models.AutoField(primary_key=True)
    username = None
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profile_images', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']


class Calendar(models.Model):
    objects: models.Manager

    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='calendar')
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    start_date = models.DateField()
    end_date = models.DateField()
    start_hour = models.IntegerField(default=0)
    end_hour = models.IntegerField(default=23)

    time_slots = models.JSONField()
    timezone = models.CharField(max_length=100)


class Contact(models.Model):
    objects: models.Manager

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    profile_image = models.ImageField(upload_to='profile_images', null=True, blank=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='contacts')


class Meeting(models.Model):
    objects: models.Manager

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    description = models.TextField(default='')
    is_virtual = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    location = models.TextField(max_length=100, default='', blank=True)

    # People
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name='meetings')
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='meetings')
    invitee = models.ForeignKey(Contact, related_name='meetings', on_delete=models.CASCADE)

    # Time
    duration = models.IntegerField()
    regularity = models.CharField(max_length=10, default='once')

    # A meeting would be pending if time is not set
    time = models.DateTimeField(null=True, blank=True)
