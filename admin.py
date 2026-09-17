"""
Django Admin integration for the Student model.
Allows administrators to view, search, filter, and modify students via /admin/.
"""

from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'department', 'year', 'cgpa', 'created_at')
    list_filter = ('department', 'year')
    search_fields = ('name', 'email', 'department')
    ordering = ('-id',)
    readonly_fields = ('created_at', 'updated_at')
