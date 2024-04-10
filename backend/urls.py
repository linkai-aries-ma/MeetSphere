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
import mimetypes
from pathlib import Path

from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, re_path
from django.views.generic import TemplateView

from .meetsphere.views import *
from .meetsphere.views_meeting import *


def create_serve_index():
    """
    Creates a function that serves the index.html file from the frontend/dist/ directory.
    """
    dist = Path(__file__).parent.parent / "dist"
    index = dist / "index.html"
    if not index.exists():
        print("ERROR: Frontend not built. Run `yarn build` in the frontend directory.")
        exit(1)
    index_content = index.read_text('utf-8')

    # Load all files in dist/ as a mapping
    dist_files = {str(pth.relative_to(dist)).replace("\\", '/'): pth.read_bytes() for pth in dist.glob('**/*') if pth.is_file()}
    print(f"Loaded {len(dist_files)} files from dist/")
    types = {k: mimetypes.guess_type(k)[0] for k in dist_files.keys()}

    def static_index(request, path: str):
        # Try to find file in dist/
        if path in dist_files:
            return HttpResponse(dist_files[path], types[path])
        # If not found, serve index.html
        return HttpResponse(index_content, content_type="text/html")

    return static_index


urlpatterns = ([
    path('admin/', admin.site.urls),

    # API Endpoints
    re_path('api/register/?$', user_register, name='Register'),
    re_path('api/login/?$', user_login, name='Login'),
    re_path('api/logout/?$', user_logout, name='Logout'),
    re_path('api/user/?$', user_info, name='View/Edit user info (GET/POST)'),
    re_path('api/user/pfp/?$', user_profile_image, name='Change profile picture (POST)'),
    re_path('api/contacts/?$', contacts_api, name='Add/List/Delete/Modify contacts (GET/POST/DELETE/PATCH)'),
    re_path('api/contacts/pfp/?$', contact_pfp, name='Change contact profile picture (POST)'),
    re_path('api/calendar/?$', calendar_api, name='Add/List/Delete/Modify calendars (GET/POST/DELETE/PATCH)'),
    re_path('api/meetings/?$', meetings_api, name='Add/List/Delete/Modify Meetings (GET/POST/DELETE/PATCH)'),
    re_path(r'api/meetings/(?P<pk>[\w-]+)/invite/?$', send_invite, name='Send meeting invite (POST)'),
    re_path(r'api/meetings/(?P<pk>[\w-]+)/remind/?$', send_remind, name='Send meeting reminder (POST)'),
    re_path(r'api/meetings/(?P<pk>[\w-]+)/accept/?$', accept_meeting, name='Accept meeting invite (POST)'),
    re_path(r'api/meetings/(?P<pk>[\w-]+)/?$', get_meeting, name='Get meeting (GET)'),

    re_path('api/test-send-email/?$', test_email),
])

# Serve user-uploaded media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Web frontend (all unknown paths serve dist/)
urlpatterns += [re_path(r'^(?P<path>.*)$', create_serve_index())]

