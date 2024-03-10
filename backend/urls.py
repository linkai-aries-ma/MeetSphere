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
from django.contrib import admin
from django.urls import path

from .meetsphere.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', user_register, name='Register'),
    path('login/', user_login, name='Login'),
    path('logout/', user_logout, name='Logout'),
    path('user/', user_info, name='View/Edit user info (GET/POST)'),
    path('contacts/', contacts, name='Add/List/Delete contacts (GET/POST/DELETE)'),
    path('add_calendar/', add_calendar, name='Add calendar (POST)'),
    path('calendar/', calendar, name='Calendar (GET/POST)'),

    path('test-send-email/', test_email)
]
