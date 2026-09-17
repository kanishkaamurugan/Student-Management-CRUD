#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.
This file is the entry point for running Django management commands such as:
- python manage.py runserver (Starts the local development server)
- python manage.py makemigrations (Prepares database migration files)
- python manage.py migrate (Applies database migrations to SQLite)
- python manage.py test (Executes automated tests)
"""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
