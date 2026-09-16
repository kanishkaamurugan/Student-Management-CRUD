# Postman API Testing Guide for Student Management System

This guide explains how to test every REST API endpoint and CRUD operation using **Postman**.

---

## 1. Quick Import into Postman

We have included a complete, ready-to-run Postman collection:
📁 `postman/Student_Management_API.postman_collection.json`

### Steps to Import:
1. Open the **Postman** desktop application or web agent.
2. Click the **Import** button in the top-left corner of Postman.
3. Drag and drop the file `postman/Student_Management_API.postman_collection.json` (or click *Browse* and select it).
4. Click **Import**.
5. You will now see the collection named **"Student Management System API - Complete CRUD Collection"** in your left sidebar.

---

## 2. Prerequisites
Make sure your Django backend server is running:
```powershell
# From the project root
.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```
Base URL: `http://127.0.0.1:8000/api/students/`

---

## 3. Step-by-Step Manual CRUD Testing Instructions

If you want to construct the requests manually in Postman or understand each step, follow the instructions below:

---

### Step 1: Create Student (POST)
- **Method:** `POST`
- **URL:** `http://127.0.0.1:8000/api/students/`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Kavya Krishnan",
    "email": "kavya.krishnan@college.edu",
    "department": "Computer Science",
    "year": 3,
    "cgpa": 9.25
  }
  ```
- **Expected Status Code:** `201 Created`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Student created successfully.",
    "data": {
      "id": 1,
      "name": "Kavya Krishnan",
      "email": "kavya.krishnan@college.edu",
      "department": "Computer Science",
      "year": 3,
      "cgpa": "9.25",
      "created_at": "2026-09-16T...",
      "updated_at": "2026-09-16T..."
    }
  }
  ```

---

### Step 2: Read All Students (GET)
- **Method:** `GET`
- **URL:** `http://127.0.0.1:8000/api/students/`
- **Expected Status Code:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": 1,
        "name": "Kavya Krishnan",
        "email": "kavya.krishnan@college.edu",
        "department": "Computer Science",
        "year": 3,
        "cgpa": "9.25"
      }
    ]
  }
  ```

---

### Step 3: Search Students (GET with Query Param)
- **Method:** `GET`
- **URL:** `http://127.0.0.1:8000/api/students/?search=Kavya`
- **Expected Status Code:** `200 OK`
- **Query Params:**
  - `search` = `Kavya` (matches against name, email, or department)

---

### Step 4: Filter Students by Department and Year (GET)
- **Method:** `GET`
- **URL:** `http://127.0.0.1:8000/api/students/?department=Computer%20Science&year=3`
- **Expected Status Code:** `200 OK`
- **Query Params:**
  - `department` = `Computer Science`
  - `year` = `3`

---

### Step 5: Read Single Student (GET by ID)
- **Method:** `GET`
- **URL:** `http://127.0.0.1:8000/api/students/1/`
- **Expected Status Code:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Kavya Krishnan",
      "email": "kavya.krishnan@college.edu",
      "department": "Computer Science",
      "year": 3,
      "cgpa": "9.25"
    }
  }
  ```

---

### Step 6: Full Update Student (PUT)
- **Method:** `PUT`
- **URL:** `http://127.0.0.1:8000/api/students/1/`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Kavya Krishnan Updated",
    "email": "kavya.krishnan@college.edu",
    "department": "Computer Science",
    "year": 4,
    "cgpa": 9.80
  }
  ```
- **Expected Status Code:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Student updated successfully.",
    "data": {
      "id": 1,
      "name": "Kavya Krishnan Updated",
      "email": "kavya.krishnan@college.edu",
      "department": "Computer Science",
      "year": 4,
      "cgpa": "9.80"
    }
  }
  ```

---

### Step 7: Partial Update Student (PATCH)
- **Method:** `PATCH`
- **URL:** `http://127.0.0.1:8000/api/students/1/`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
  ```json
  {
    "cgpa": 9.95
  }
  ```
- **Expected Status Code:** `200 OK`
- **Expected Response:** Returns updated record with `cgpa: "9.95"`.

---

### Step 8: Delete Student (DELETE)
- **Method:** `DELETE`
- **URL:** `http://127.0.0.1:8000/api/students/1/`
- **Expected Status Code:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Student #1 (Kavya Krishnan Updated) has been deleted successfully."
  }
  ```

---

## 4. Negative Test Cases (Validation Testing)

### 4.1 Missing Required Fields:
- **POST** `/api/students/` with body `{ "name": "" }`
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "success": false,
    "message": "Validation failed while creating student.",
    "errors": {
      "name": ["This field may not be blank."],
      "email": ["This field is required."]
    }
  }
  ```

### 4.2 Duplicate Email Address:
- **POST** `/api/students/` with an email already taken.
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "success": false,
    "errors": {
      "email": ["Student with this email already exists."]
    }
  }
  ```

### 4.3 Invalid CGPA (> 10.00 or negative):
- **POST** `/api/students/` with `"cgpa": 11.5`
- **Expected Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "success": false,
    "errors": {
      "cgpa": ["Ensure this value is less than or equal to 10.00."]
    }
  }
  ```

### 4.4 Non-Existent Student ID:
- **GET** `/api/students/99999/`
- **Expected Status:** `404 Not Found`
- **Response:**
  ```json
  {
    "success": false,
    "message": "Student with ID 99999 not found."
  }
  ```
