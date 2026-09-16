"""
URL Configuration for student_management project.

Routes:
- /admin/ : Django default administration dashboard
- /api/ : REST API endpoints for students
- / : Serves the frontend single-page dashboard (HTML/CSS/JS)
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from pathlib import Path

FRONTEND_DIR = settings.BASE_DIR.parent / 'frontend'

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),

    # REST API endpoints for student CRUD operations
    path('api/', include('students.urls')),

    # Root route: serves frontend/index.html
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # Direct static file access for css and js when served through Django
    path('css/<path:path>', serve, {'document_root': FRONTEND_DIR / 'css'}),
    path('js/<path:path>', serve, {'document_root': FRONTEND_DIR / 'js'}),
]
