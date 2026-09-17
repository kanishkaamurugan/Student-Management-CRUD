"""
Database models for Student Management System.

This model defines the schema of the 'students_student' table in the SQLite database.
Fields:
- id: Primary Key (Auto-incrementing integer)
- name: Student's full name (String, max length 100)
- email: Student's email address (Unique String, validated email format)
- department: Academic department / major (String, max length 100)
- year: Current year of study (Integer, range: 1 to 4)
- cgpa: Cumulative Grade Point Average (Decimal, range: 0.00 to 10.00)
- created_at: Timestamp when the record was created
- updated_at: Timestamp when the record was last modified
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Student(models.Model):
    # Department choices to standardize options while allowing flexible text
    DEPARTMENT_CHOICES = [
        ('Computer Science', 'Computer Science'),
        ('Information Technology', 'Information Technology'),
        ('Electronics & Communication', 'Electronics & Communication'),
        ('Electrical & Electronics', 'Electrical & Electronics'),
        ('Mechanical Engineering', 'Mechanical Engineering'),
        ('Civil Engineering', 'Civil Engineering'),
        ('Biotechnology', 'Biotechnology'),
        ('Data Science & AI', 'Data Science & AI'),
    ]

    # Student full name
    name = models.CharField(
        max_length=100,
        help_text="Student's full name"
    )

    # Email address must be unique across all students
    email = models.EmailField(
        unique=True,
        help_text="Unique student email address"
    )

    # Academic Department
    department = models.CharField(
        max_length=100,
        help_text="Academic department"
    )

    # Year of study: restricted to 1, 2, 3, or 4
    year = models.IntegerField(
        validators=[
            MinValueValidator(1, message="Year must be at least 1."),
            MaxValueValidator(4, message="Year cannot exceed 4.")
        ],
        help_text="Current academic year (1-4)"
    )

    # CGPA: 0.00 to 10.00 scale
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.00'), message="CGPA cannot be negative."),
            MaxValueValidator(Decimal('10.00'), message="CGPA cannot exceed 10.00.")
        ],
        help_text="Cumulative GPA on a scale of 0.00 to 10.00"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of student enrollment"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last record update"
    )

    class Meta:
        ordering = ['-id']  # Newest students appear first
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.department} Year {self.year}"
