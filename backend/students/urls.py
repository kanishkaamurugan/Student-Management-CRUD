"""
URL patterns for the students application.

Uses Django REST Framework's DefaultRouter to automatically register
standard RESTful URL endpoints:
- GET    /api/students/       -> list()
- POST   /api/students/       -> create()
- GET    /api/students/{id}/  -> retrieve()
- PUT    /api/students/{id}/  -> update()
- PATCH  /api/students/{id}/  -> partial_update()
- DELETE /api/students/{id}/  -> destroy()
- GET    /api/students/stats/ -> stats()
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

# Create router and register our StudentViewSet
router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')

urlpatterns = [
    path('', include(router.urls)),
]
