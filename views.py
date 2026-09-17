"""
API Views for Student Management System.

Implements all CRUD endpoints according to the REST architectural style:
- CREATE : POST   /api/students/       (Create a new student)
- READ   : GET    /api/students/       (List all students with optional search & filter)
- READ   : GET    /api/students/{id}/  (Retrieve a single student by primary key)
- UPDATE : PUT    /api/students/{id}/  (Full update of an existing student)
- UPDATE : PATCH  /api/students/{id}/  (Partial update of an existing student)
- DELETE : DELETE /api/students/{id}/  (Remove student record from database)
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet that handles all CRUD operations, search, and filtering
    for Student records.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        """
        Optionally filters the returned students by:
        - `search`: Case-insensitive search on name, email, or department
        - `department`: Filter by exact or partial department name
        - `year`: Filter by academic year (1, 2, 3, 4)
        - `ordering`: Sort by specific field (e.g. name, -cgpa, id)
        """
        queryset = Student.objects.all()

        # 1. Keyword search (name, email, department)
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(department__icontains=search_query)
            )

        # 2. Filter by Department
        department_filter = self.request.query_params.get('department', '').strip()
        if department_filter:
            queryset = queryset.filter(department__iexact=department_filter)

        # 3. Filter by Academic Year
        year_filter = self.request.query_params.get('year', '').strip()
        if year_filter:
            try:
                year_val = int(year_filter)
                queryset = queryset.filter(year=year_val)
            except ValueError:
                pass  # Ignore invalid year query parameter

        # 4. Optional ordering
        ordering = self.request.query_params.get('ordering', '-id')
        allowed_order_fields = ['id', '-id', 'name', '-name', 'year', '-year', 'cgpa', '-cgpa']
        if ordering in allowed_order_fields:
            queryset = queryset.order_by(ordering)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        CREATE: Handles POST /api/students/
        Validates request data and creates a new student.
        Returns 201 Created on success or 400 Bad Request with field errors.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(
                {
                    "success": True,
                    "message": "Student created successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "message": "Validation failed while creating student.",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def list(self, request, *args, **kwargs):
        """
        READ ALL: Handles GET /api/students/
        Returns list of student records matching query parameters.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "count": queryset.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        """
        READ ONE: Handles GET /api/students/{id}/
        Returns a single student record by primary key.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(
                {
                    "success": True,
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {
                    "success": False,
                    "message": f"Student with ID {kwargs.get('pk')} not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, *args, **kwargs):
        """
        UPDATE (Full): Handles PUT /api/students/{id}/
        Updates all fields of an existing student.
        """
        partial = kwargs.pop('partial', False)
        try:
            instance = self.get_object()
        except Exception:
            return Response(
                {
                    "success": False,
                    "message": f"Student with ID {kwargs.get('pk')} not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(
                {
                    "success": True,
                    "message": "Student updated successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "success": False,
                "message": "Validation failed while updating student.",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        """
        UPDATE (Partial): Handles PATCH /api/students/{id}/
        Updates specific fields of an existing student.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        DELETE: Handles DELETE /api/students/{id}/
        Deletes a student record permanently from SQLite database.
        """
        try:
            instance = self.get_object()
            student_id = instance.id
            student_name = instance.name
            self.perform_destroy(instance)
            return Response(
                {
                    "success": True,
                    "message": f"Student #{student_id} ({student_name}) has been deleted successfully."
                },
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {
                    "success": False,
                    "message": f"Student with ID {kwargs.get('pk')} not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        DASHBOARD STATS: GET /api/students/stats/
        Returns aggregated summary statistics:
        - total_students
        - average_cgpa
        - department_distribution
        - year_distribution
        """
        from django.db.models import Avg, Count
        total = Student.objects.count()
        avg_cgpa_dict = Student.objects.aggregate(Avg('cgpa'))
        avg_cgpa = avg_cgpa_dict.get('cgpa__avg')
        avg_cgpa_val = round(float(avg_cgpa), 2) if avg_cgpa is not None else 0.00

        # Department distribution
        dept_counts = (
            Student.objects.values('department')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Year distribution
        year_counts = (
            Student.objects.values('year')
            .annotate(count=Count('id'))
            .order_by('year')
        )

        return Response({
            "success": True,
            "data": {
                "total_students": total,
                "average_cgpa": avg_cgpa_val,
                "department_counts": list(dept_counts),
                "year_counts": list(year_counts)
            }
        }, status=status.HTTP_200_OK)
