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

from .meetsphere.views import user_register, user_login, add_contact, delete_contact, list_contacts, user_logout, \
    add_calendar, calendar, user_info

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', user_register, name='register'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('user/', user_info),
    path('add_contact/', add_contact, name='add_contact'),
    path('delete_contact/', delete_contact, name='delete_contact'),
    path('list_contacts/', list_contacts, name='list_contacts'),
    path('add_calendar/', add_calendar, name='add_calendar'),
    path('calendar/', calendar, name='get_calendar')
]
