"""
Automated Test Suite for Student Management System.

Covers all test requirements specified in the SOP (Section 10):
- Create with valid, missing, duplicate, and invalid data
- Read with empty and populated databases
- Read single student (valid ID and 404 for invalid ID)
- Update student with valid and invalid data (PUT & PATCH)
- Delete student with valid and invalid IDs
- Search and filtering capabilities
- Model and serializer boundary validations (CGPA, Year, Email format)
- Aggregated dashboard statistics
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Student


class StudentModelTest(TestCase):
    """Unit tests for the Student database model."""

    def test_create_valid_student(self):
        """Test creating a student instance directly via ORM."""
        student = Student.objects.create(
            name="Aarav Sharma",
            email="aarav.sharma@college.edu",
            department="Computer Science",
            year=3,
            cgpa=9.15
        )
        self.assertEqual(str(student), "Aarav Sharma (aarav.sharma@college.edu) - Computer Science Year 3")
        self.assertEqual(Student.objects.count(), 1)


class StudentAPITestCase(TestCase):
    """Integration test suite for Student REST API endpoints."""

    def setUp(self):
        """Initialize APIClient and seed test data before each test."""
        self.client = APIClient()
        self.list_create_url = '/api/students/'

        # Create sample student records for read/update/delete tests
        self.student1 = Student.objects.create(
            name="Priya Patel",
            email="priya.patel@college.edu",
            department="Computer Science",
            year=4,
            cgpa=9.40
        )
        self.student2 = Student.objects.create(
            name="Rohan Verma",
            email="rohan.verma@college.edu",
            department="Information Technology",
            year=2,
            cgpa=8.20
        )

    # -------------------------------------------------------------
    # 1. CREATE TESTS (POST /api/students/)
    # -------------------------------------------------------------
    def test_create_student_success(self):
        """Test creating a new student with valid data returns 201 Created."""
        payload = {
            "name": "Ananya Sen",
            "email": "ananya.sen@college.edu",
            "department": "Biotechnology",
            "year": 1,
            "cgpa": 8.75
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['name'], "Ananya Sen")
        self.assertEqual(response.data['data']['email'], "ananya.sen@college.edu")
        self.assertEqual(Student.objects.count(), 3)

    def test_create_student_missing_fields(self):
        """Test creating a student with missing mandatory fields returns 400 Bad Request."""
        payload = {
            "name": "",
            "email": ""
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('name', response.data['errors'])
        self.assertIn('email', response.data['errors'])

    def test_create_student_duplicate_email(self):
        """Test creating a student with an already existing email returns 400 Bad Request."""
        payload = {
            "name": "Duplicate Priya",
            "email": "priya.patel@college.edu",  # Duplicate of student1
            "department": "Civil Engineering",
            "year": 2,
            "cgpa": 7.50
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_create_student_invalid_email_format(self):
        """Test email regex validation rejects malformed email strings."""
        payload = {
            "name": "Kavya Nair",
            "email": "not-an-email",
            "department": "Computer Science",
            "year": 2,
            "cgpa": 8.00
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_create_student_invalid_year(self):
        """Test year out of range (e.g. 0 or 5) returns validation error."""
        payload = {
            "name": "Vikram Rao",
            "email": "vikram.rao@college.edu",
            "department": "Mechanical Engineering",
            "year": 5,  # Only 1-4 allowed
            "cgpa": 7.80
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('year', response.data['errors'])

    def test_create_student_invalid_cgpa(self):
        """Test CGPA out of range (e.g. negative or >10.00) returns validation error."""
        payload = {
            "name": "Vikram Rao",
            "email": "vikram.rao@college.edu",
            "department": "Mechanical Engineering",
            "year": 3,
            "cgpa": 11.50  # Max is 10.00
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cgpa', response.data['errors'])

    # -------------------------------------------------------------
    # 2. READ TESTS (GET /api/students/ & GET /api/students/{id}/)
    # -------------------------------------------------------------
    def test_read_all_students_populated(self):
        """Test listing all students when database has records."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['data']), 2)

    def test_read_all_students_empty(self):
        """Test listing all students when database is empty."""
        Student.objects.all().delete()
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(len(response.data['data']), 0)

    def test_read_single_student_success(self):
        """Test reading a single student by existing ID returns 200 OK."""
        url = f'/api/students/{self.student1.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], "Priya Patel")
        self.assertEqual(response.data['data']['email'], "priya.patel@college.edu")

    def test_read_single_student_not_found(self):
        """Test reading a non-existent student ID returns 404 Not Found."""
        url = '/api/students/99999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data['success'])

    # -------------------------------------------------------------
    # 3. UPDATE TESTS (PUT & PATCH /api/students/{id}/)
    # -------------------------------------------------------------
    def test_update_student_put_success(self):
        """Test full update (PUT) with valid data."""
        url = f'/api/students/{self.student1.id}/'
        payload = {
            "name": "Priya Patel",
            "email": "priya.updated@college.edu",
            "department": "Computer Science",
            "year": 4,
            "cgpa": 9.80
        }
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student1.refresh_from_db()
        self.assertEqual(self.student1.email, "priya.updated@college.edu")
        self.assertEqual(float(self.student1.cgpa), 9.80)

    def test_update_student_patch_success(self):
        """Test partial update (PATCH) updating only CGPA."""
        url = f'/api/students/{self.student2.id}/'
        payload = {"cgpa": 8.90}
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student2.refresh_from_db()
        self.assertEqual(float(self.student2.cgpa), 8.90)

    def test_update_student_invalid_data(self):
        """Test updating with invalid CGPA returns 400 Bad Request."""
        url = f'/api/students/{self.student1.id}/'
        payload = {"cgpa": -2.0}
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cgpa', response.data['errors'])

    # -------------------------------------------------------------
    # 4. DELETE TESTS (DELETE /api/students/{id}/)
    # -------------------------------------------------------------
    def test_delete_student_success(self):
        """Test deleting an existing student returns 200 OK and removes record."""
        target_id = self.student1.id
        url = f'/api/students/{target_id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Student.objects.filter(id=target_id).exists())

    def test_delete_student_not_found(self):
        """Test deleting a non-existent student returns 404 Not Found."""
        url = '/api/students/99999/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -------------------------------------------------------------
    # 5. SEARCH & FILTER TESTS
    # -------------------------------------------------------------
    def test_search_by_name(self):
        """Test search query filters students by name."""
        response = self.client.get(f'{self.list_create_url}?search=Priya')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['name'], "Priya Patel")

    def test_search_by_email(self):
        """Test search query filters students by email keyword."""
        response = self.client.get(f'{self.list_create_url}?search=rohan.verma')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['name'], "Rohan Verma")

    def test_filter_by_department(self):
        """Test filtering students by department."""
        response = self.client.get(f'{self.list_create_url}?department=Computer Science')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['department'], "Computer Science")

    def test_filter_by_year(self):
        """Test filtering students by academic year."""
        response = self.client.get(f'{self.list_create_url}?year=2')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['data'][0]['year'], 2)

    # -------------------------------------------------------------
    # 6. DASHBOARD STATS TEST
    # -------------------------------------------------------------
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint returns correct aggregated numbers."""
        response = self.client.get('/api/students/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['total_students'], 2)
        # Average of 9.40 and 8.20 is 8.80
        self.assertAlmostEqual(response.data['data']['average_cgpa'], 8.80, places=2)
