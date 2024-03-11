"""
URL configuration for meetsphere project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from .meetsphere.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', user_register, name='Register'),
    path('login/', user_login, name='Login'),
    path('logout/', user_logout, name='Logout'),
    path('user/', user_info, name='View/Edit user info (GET/POST)'),
    path('user/pfp/', user_profile_image, name='Change profile picture (POST)'),
    path('contacts/', contacts_api, name='Add/List/Delete/Modify contacts (GET/POST/DELETE/PATCH)'),
    path('calendar/', calendar_api, name='Add/List/Delete/Modify calendars (GET/POST/DELETE/PATCH)'),
    path('meetings/', meetings, name='Add/List/Delete/Modify Meetings (GET/POST/DELETE/PATCH)'),
    path('confirm_meeting/', confirm_meeting, name='Confirm Meetings (PATCH)'),

    path('test-send-email/', test_email)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
