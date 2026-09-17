"""
Serializers for Student Management System.

Serializers define how Student model instances are converted into JSON
representations for API responses, and how JSON payloads from API requests
are validated and deserialized into database records.
"""

from rest_framework import serializers
from .models import Student
import re


class StudentSerializer(serializers.ModelSerializer):
    """
    ModelSerializer for the Student model.
    Implements comprehensive server-side field and object-level validation.
    """

    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'email',
            'department',
            'year',
            'cgpa',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """
        Validate that the student name is non-empty, stripped,
        and contains only alphabetical characters, spaces, dots, or hyphens.
        """
        stripped_name = value.strip()
        if not stripped_name:
            raise serializers.ValidationError("Student name cannot be empty or just whitespace.")
        if len(stripped_name) < 2:
            raise serializers.ValidationError("Student name must be at least 2 characters long.")
        if len(stripped_name) > 100:
            raise serializers.ValidationError("Student name cannot exceed 100 characters.")
        # Check that the name contains valid name characters
        if not re.match(r"^[A-Za-z\s\.\-']+$", stripped_name):
            raise serializers.ValidationError(
                "Student name should only contain letters, spaces, dots, and hyphens."
            )
        return stripped_name

    def validate_email(self, value):
        """
        Validate that email follows standard format and is lowercased.
        Uniqueness is checked during creation and update.
        """
        cleaned_email = value.strip().lower()
        if not cleaned_email:
            raise serializers.ValidationError("Email address is required.")

        # Standard RFC 5322 compatible email pattern
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, cleaned_email):
            raise serializers.ValidationError("Please provide a valid email address format.")

        # Check for duplicate email (excluding current instance during update)
        instance = getattr(self, 'instance', None)
        existing = Student.objects.filter(email__iexact=cleaned_email)
        if instance:
            existing = existing.exclude(pk=instance.pk)
        if existing.exists():
            raise serializers.ValidationError("A student with this email address already exists.")

        return cleaned_email

    def validate_department(self, value):
        """
        Validate that department is non-empty and stripped.
        """
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Department field cannot be empty.")
        if len(stripped) < 2:
            raise serializers.ValidationError("Department name must be at least 2 characters.")
        return stripped

    def validate_year(self, value):
        """
        Validate that year of study is an integer between 1 and 4.
        """
        if value is None:
            raise serializers.ValidationError("Academic year is required.")
        try:
            val_int = int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Year must be an integer between 1 and 4.")

        if val_int < 1 or val_int > 4:
            raise serializers.ValidationError("Year must be between 1 and 4.")
        return val_int

    def validate_cgpa(self, value):
        """
        Validate that CGPA is a decimal between 0.00 and 10.00.
        """
        if value is None:
            raise serializers.ValidationError("CGPA is required.")
        try:
            val_float = float(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("CGPA must be a valid decimal number.")

        if val_float < 0.0 or val_float > 10.0:
            raise serializers.ValidationError("CGPA must be between 0.00 and 10.00.")

        # Round to 2 decimal places
        return round(val_float, 2)
