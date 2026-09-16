# COLLEGE PROJECT REPORT
## Complete CRUD-Based Web Application Development
### Student Management System (EduManage)

**Academic Year:** 2026  
**Technology Stack:** Python Django, Django REST Framework, SQLite, HTML5, CSS3, JavaScript, Postman, Git/GitHub  
**Document Type:** Formal Project Report & Submission Document  

---

## Executive Summary
This project report details the design, architecture, implementation, testing, and deployment of a full-stack **Student Management System** adhering strictly to the guidelines set forth in the Standard Operating Procedure (SOP) for CRUD-Based Web Application Development.

The application allows academic administrators and faculty to perform complete **Create, Read, Update, and Delete (CRUD)** operations on student records with two-tier data validation (client-side and server-side), real-time search, department and year filtering, and aggregated statistical analytics. The system utilizes a decoupled architecture with a Python Django REST Framework backend serving JSON endpoints and an interactive HTML5/CSS3/Vanilla JavaScript frontend.

---

## 1. Title and Project Overview

- **Project Title:** Student Management System (EduManage)
- **Primary Domain:** Web Application Development & Academic Information Systems
- **System Nature:** Full-Stack Decoupled CRUD Application
- **Core Entities Managed:** Student Profiles (`id`, `name`, `email`, `department`, `year`, `cgpa`, `created_at`, `updated_at`)

---

## 2. Problem Statement

Conventional record-keeping practices in academic environments frequently rely on decentralized, manual spreadsheets or paper registers. These legacy methods exhibit several severe operational vulnerabilities:
1. **Data Inconsistency and Human Error:** Lack of automated field validation allows invalid emails, negative CGPAs, or invalid academic years to be entered.
2. **Duplicate Enrolments:** Absence of database-enforced uniqueness constraints causes duplicate records with conflicting details.
3. **Retrieval Bottlenecks:** Finding an individual student's record or calculating department averages requires manual searching and calculation.
4. **Lack of Integration:** Spreadsheets cannot be queried securely by external client applications or mobile interfaces due to the lack of standardized RESTful APIs.

**EduManage** solves these problems by providing an automated, database-backed, validated, and responsive CRUD system.

---

## 3. Objectives

- **Develop a Responsive User Interface:** Construct an accessible, intuitive web dashboard using modern HTML5, CSS3 flexbox/grid layouts, and asynchronous JavaScript (Fetch API).
- **Engineer a Robust RESTful API Backend:** Build standard API endpoints using Python Django and Django REST Framework that adhere to REST conventions, returning standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
- **Implement Double-Layered Data Validation:** Enforce validation rules on the frontend for immediate UI feedback, and mirror them rigorously on the server serializer level to ensure database integrity.
- **Relational Data Persistence:** Utilize the Django Object-Relational Mapper (ORM) backed by an SQLite database with structured migrations.
- **Advanced Querying & Aggregations:** Implement debounced live keyword search, multi-parameter filtering (by department and study year), and real-time metric calculations (average CGPA, department count).
- **Comprehensive Quality Assurance:** Verify all operations via 21 automated Django unit tests and an importable Postman API test collection.

---

## 4. Technology Stack & Environment

| Layer | Technology | Version | Purpose in Project |
|:---|:---|:---|:---|
| **Frontend UI** | HTML5, CSS3, Vanilla JS | ES6+ | Responsive layout, DOM manipulation, asynchronous Fetch requests |
| **Styling & Icons** | FontAwesome 6, Inter Font | CDN | Iconography, typography, visual hierarchy |
| **Backend Framework** | Python Django | 5.1.15 | Business logic, routing, ORM, static asset serving |
| **REST API Engine** | Django REST Framework | 3.15.2 | Serialization, API viewsets, input validation, JSON formatting |
| **Cross-Origin Security** | django-cors-headers | 4.4.0 | CORS middleware allowing secure cross-origin requests |
| **Database** | SQLite3 | 3.x | Zero-configuration relational database |
| **API Testing** | Postman | v2.1 | HTTP request verification, test scripts, assertion checking |
| **Version Control** | Git & GitHub | 2.55+ | Distributed version control, branch management, code history |

---

## 5. System Architecture

The application adopts a **Decoupled Three-Tier Architecture**:

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION TIER (FRONTEND)                            |
|  - HTML5 Semantic Structure                                                       |
|  - CSS3 Modern Responsive Styling (Flexbox, Grid, Modal Animations, Toast Alerts) |
|  - Vanilla JavaScript ES6 (Fetch API, DOM manipulation, Regex Validation)          |
+-----------------------------------------------------------------------------------+
                                      ▲
                                      │ HTTP / JSON Requests (CORS Enabled)
                                      ▼
+-----------------------------------------------------------------------------------+
|                         APPLICATION TIER (DJANGO BACKEND)                         |
|  - Django URL Dispatcher & DefaultRouter                                          |
|  - StudentViewSet (CRUD business logic, search & filtering)                       |
|  - StudentSerializer (Two-way conversion, validation rules)                       |
|  - CORS Middleware & Security Headers                                            |
+-----------------------------------------------------------------------------------+
                                      ▲
                                      │ ORM Queries & Migrations
                                      ▼
+-----------------------------------------------------------------------------------+
|                              DATA TIER (DATABASE)                                 |
|  - SQLite3 Relational Database Engine                                             |
|  - students_student Table with Unique Indexes and Constraints                     |
+-----------------------------------------------------------------------------------+
```

---

## 6. Database Schema & ER Diagram

The database schema is managed via Django migrations (`backend/students/migrations/0001_initial.py`).

### Entity-Relationship Diagram:

```
+-----------------------------------------------------------------------------------+
|                                  STUDENT                                          |
+----------------------+--------------------+---------------------------------------+
| Field Name           | Data Type          | Constraints & Descriptions            |
+----------------------+--------------------+---------------------------------------+
| id                   | BigAutoField (PK)  | Auto-increment, Primary Key           |
| name                 | CharField(100)     | Mandatory, Length >= 2, Regex Alpha   |
| email                | EmailField(254)    | Mandatory, Unique Index, Valid Email  |
| department           | CharField(100)     | Mandatory, Academic Department Name   |
| year                 | IntegerField       | Mandatory, Range: [1, 4]              |
| cgpa                 | DecimalField(4, 2) | Mandatory, Range: [0.00, 10.00]       |
| created_at           | DateTimeField      | Auto-generated timestamp on create    |
| updated_at           | DateTimeField      | Auto-updated timestamp on modification|
+----------------------+--------------------+---------------------------------------+
```

---

## 7. REST API Endpoint Documentation

Base Endpoint: `http://127.0.0.1:8000/api/students/`

| HTTP Method | Endpoint | Request Body (JSON) | Success Status | Description |
|:---|:---|:---|:---|:---|
| **`GET`** | `/api/students/` | None | `200 OK` | Retrieves all student records. Supports `?search=`, `?department=`, `?year=`, `?ordering=`. |
| **`POST`** | `/api/students/` | `{"name", "email", "department", "year", "cgpa"}` | `201 Created` | Validates input and persists a new student record. |
| **`GET`** | `/api/students/{id}/` | None | `200 OK` | Retrieves single student details by primary key ID (returns `404` if not found). |
| **`PUT`** | `/api/students/{id}/` | `{"name", "email", "department", "year", "cgpa"}` | `200 OK` | Performs full replacement of an existing student's data. |
| **`PATCH`** | `/api/students/{id}/` | Subset of student fields | `200 OK` | Updates only the supplied fields (e.g. updating only `cgpa`). |
| **`DELETE`** | `/api/students/{id}/` | None | `200 OK` | Permanently deletes student record from SQLite database. |
| **`GET`** | `/api/students/stats/` | None | `200 OK` | Returns aggregated metrics: total students, average CGPA, and counts by department and year. |

---

## 8. CRUD Functional Implementation Details

### 1. Create Operation
- **User Flow:** User clicks "+ Add New Student", fills out the modal form, and clicks "Save Student".
- **Validation:** JavaScript performs regex and range checks. If valid, sends `POST` request with JSON payload.
- **Server Logic:** Serializer validates name format, email uniqueness, year (1-4), and CGPA (0.00-10.00). Persists to SQLite using `Student.objects.create()`.
- **UI Response:** Modal closes, a green toast notification appears, and the table dynamically updates without full page refresh.

### 2. Read Operation
- **User Flow:** On page load, `loadStudents()` sends `GET /api/students/`.
- **Display Modes:** User can toggle between **Table View** (compact rows with action buttons) and **Card Grid View** (card tiles with badges).
- **Search & Filter:** User types in the search bar (debounced at 300ms) or selects department/year from dropdowns. API responds with filtered results.

### 3. Update Operation
- **User Flow:** User clicks the edit icon on any student row. The modal loads the student's existing details.
- **Server Logic:** Form sends `PUT /api/students/{id}/`. Serializer excludes current student ID when checking email uniqueness.
- **UI Response:** Table row reflects the updated values immediately, stats cards recalculate.

### 4. Delete Operation
- **User Flow:** User clicks the trash icon. A custom confirmation modal opens asking for confirmation.
- **Server Logic:** On confirm, client sends `DELETE /api/students/{id}/`. Backend calls `instance.delete()`.
- **UI Response:** Modal dismisses, record is animated out of the table, total student count decrements.

---

## 9. Validation Rules Specification

| Field Name | Client-Side Rule | Server-Side Rule | Error Message |
|:---|:---|:---|:---|
| **Name** | Required, length >= 2, only letters/spaces/dots/hyphens | `serializers.ValidationError` in `validate_name` | "Student name should only contain letters, spaces, dots, and hyphens." |
| **Email** | Required, regex `^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$` | `EmailField` + `validate_email` + unique database index | "Please provide a valid email address format." / "A student with this email address already exists." |
| **Department** | Required selection from dropdown | `validate_department` non-empty check | "Please select an academic department." |
| **Year** | Required integer between 1 and 4 | `MinValueValidator(1)`, `MaxValueValidator(4)` | "Year must be between 1 and 4." |
| **CGPA** | Required decimal between 0.00 and 10.00 | `MinValueValidator(Decimal('0.00'))`, `MaxValueValidator(Decimal('10.00'))` | "CGPA must be between 0.00 and 10.00." |

---

## 10. Automated Testing Results

The automated test suite in [`backend/students/tests.py`](file:///c:/Users/M.R.KANISHKAA/Documents/Student-Management-CRUD/backend/students/tests.py) comprises **21 comprehensive tests**:

```text
Creating test database for alias 'default'...
Found 21 test(s).
System check identified no issues (0 silenced).
.....................
----------------------------------------------------------------------
Ran 21 tests in 0.098s

OK
Destroying test database for alias 'default'...
```

### Breakdown of Test Cases:
1. `test_create_valid_student`: Verifies ORM creation and string representation.
2. `test_create_student_success`: Asserts `POST /api/students/` returns `201 Created`.
3. `test_create_student_missing_fields`: Asserts missing mandatory fields return `400 Bad Request`.
4. `test_create_student_duplicate_email`: Asserts duplicate email returns `400 Bad Request`.
5. `test_create_student_invalid_email_format`: Asserts malformed email returns `400 Bad Request`.
6. `test_create_student_invalid_year`: Asserts year > 4 or < 1 returns `400 Bad Request`.
7. `test_create_student_invalid_cgpa`: Asserts CGPA > 10.00 or negative returns `400 Bad Request`.
8. `test_read_all_students_populated`: Asserts listing returns `200 OK` with all records.
9. `test_read_all_students_empty`: Asserts listing with empty DB returns `200 OK` with count 0.
10. `test_read_single_student_success`: Asserts `GET /api/students/1/` returns `200 OK`.
11. `test_read_single_student_not_found`: Asserts `GET /api/students/99999/` returns `404 Not Found`.
12. `test_update_student_put_success`: Asserts `PUT` updates all fields with `200 OK`.
13. `test_update_student_patch_success`: Asserts `PATCH` updates single field with `200 OK`.
14. `test_update_student_invalid_data`: Asserts invalid update returns `400 Bad Request`.
15. `test_delete_student_success`: Asserts `DELETE` removes record with `200 OK`.
16. `test_delete_student_not_found`: Asserts deleting invalid ID returns `404 Not Found`.
17. `test_search_by_name`: Asserts `?search=Priya` matches name.
18. `test_search_by_email`: Asserts `?search=rohan` matches email substring.
19. `test_filter_by_department`: Asserts `?department=Computer Science` filters accurately.
20. `test_filter_by_year`: Asserts `?year=2` filters accurately.
21. `test_dashboard_stats`: Asserts `GET /api/students/stats/` returns correct aggregated counts and averages.

---

## 11. Challenges Encountered & Technical Solutions

1. **Challenge:** Browser CORS blocking frontend requests when hosted on different origins or opened via `file://`.  
   **Solution:** Integrated `django-cors-headers` middleware with `CORS_ALLOW_ALL_ORIGINS = True` and permitted headers, allowing smooth decoupled execution.
2. **Challenge:** Client-side relative paths breaking when navigating between root `/` and static asset paths.  
   **Solution:** Configured Django URL patterns with `django.views.static.serve` for direct `/css/` and `/js/` routing, and changed HTML references to relative paths.
3. **Challenge:** Inconsistent 404 error responses on `PUT` requests when non-existent IDs were passed.  
   **Solution:** Added structured `try...except` handling in `StudentViewSet.update()` to return consistent JSON error objects.
4. **Challenge:** Silent failures when the backend server is powered off.  
   **Solution:** Created a dynamic backend connectivity listener in JavaScript that renders an emergency warning banner with a retry trigger if the server goes offline.

---

## 12. Future Enhancements

- **Role-Based Access Control (RBAC):** Implement JWT authentication to provide role separation (Admin vs Student vs Faculty).
- **Batch CSV Import / Export:** Allow bulk onboarding of students by importing spreadsheet files.
- **Student Profile Picture Uploads:** Support multipart avatar image uploads stored in media directories.
- **Audit Logging:** Maintain an audit log table tracking who created, updated, or deleted records.

---

## 13. Project Repository Details

- **Version Control System:** Git
- **Hosting Platform:** GitHub
- **Default Branch:** `main`
- **Clean Commits:** All temporary files, virtual environments (`venv/`), and database files (`*.sqlite3`) are safely excluded via `.gitignore`.
