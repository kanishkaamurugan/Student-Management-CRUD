# Student Management System - Submission Screenshots Checklist & Guide

This guide gives you the **exact list of screenshots** required for your college project report and viva submission to score full marks according to the **SOP Evaluation Rubric** (Section 10, 13, and 16).

---

## 📋 Master Screenshot Checklist (14 Screenshots)

| # | Screenshot Filename | Category | What to Show in the Screenshot | Rubric Covered |
|---|---|---|---|---|
| **1** | `01_dashboard_table_view.png` | Frontend UI | Full browser window showing Dashboard with statistics cards, search/filter bar, and student records in Table View | Frontend (20%), CRUD (20%) |
| **2** | `02_dashboard_card_view.png` | Frontend UI | Dashboard showing the alternative **Card Grid View** (toggled via the grid icon button) | Frontend UI Quality (20%) |
| **3** | `03_create_student_modal.png` | Frontend UI | "Add New Student" modal dialog open with form fields filled out | Create Operation (20%) |
| **4** | `04_client_validation_error.png` | Frontend UI | Form showing red validation error messages (e.g. invalid email format, empty name, or out-of-range CGPA) | Validation (10%), Frontend (20%) |
| **5** | `05_success_toast_notification.png` | Frontend UI | Green floating toast alert: *"Student ... was successfully created!"* | UI Feedback (20%) |
| **6** | `06_view_student_profile.png` | Frontend UI | "Student Profile" modal showing avatar initials, department, academic year, and CGPA | Read Single Record (20%) |
| **7** | `07_edit_student_modal.png` | Frontend UI | "Edit Student #..." modal with existing student values pre-filled | Update Operation (20%) |
| **8** | `08_delete_confirmation_modal.png` | Frontend UI | Red-themed delete confirmation dialog asking to confirm deletion | Delete Operation (20%) |
| **9** | `09_search_filter_in_action.png` | Frontend UI | Table filtered by department or search keyword, showing filtered count update | Search & Filter (10%) |
| **10** | `10_mobile_responsive_view.png` | Frontend UI | Browser in mobile view (F12 -> device toolbar) showing mobile layout responsiveness | Responsiveness (20%) |
| **11** | `11_postman_crud_tests.png` | API Testing | Postman window showing successful API request (e.g., `POST /api/students/` returning `201 Created` with test assertions passed) | Backend / API (20%), Testing (10%) |
| **12** | `12_postman_validation_error.png` | API Testing | Postman window showing `400 Bad Request` when submitting duplicate email or invalid CGPA | Exception Handling (10%) |
| **13** | `13_django_automated_tests.png` | Backend Testing | PowerShell terminal showing `python backend/manage.py test students` with `Ran 21 tests in ... OK` | Testing Coverage (10%) |
| **14** | `14_git_commit_history.png` | Version Control | Terminal showing `git log --oneline` displaying meaningful git commit history | Git / Repository (10%) |

---

## 📸 Step-by-Step Instructions: How to Capture Each Screenshot

Make sure your backend server is running first:
```powershell
# From project folder:
.\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```
Then open: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### Screenshot 1: Full Dashboard (Table View)
- **Action:** Open `http://127.0.0.1:8000/`.
- **What to capture:** The entire browser window showing:
  - Top header ("EduManage • Student Management System")
  - The 4 statistics cards (Total Students, Average CGPA, Active Departments, Filtered Results)
  - The search and filter controls
  - The student data table populated with records.
- **Save as:** `01_dashboard_table_view.png`

---

### Screenshot 2: Card Grid View (Alternative Layout)
- **Action:** Click the **grid icon button** (next to "Student Records" header).
- **What to capture:** The records displaying in responsive cards instead of a table.
- **Save as:** `02_dashboard_card_view.png`

---

### Screenshot 3: Add New Student Modal Form
- **Action:** Click the blue **"+ Add New Student"** button.
- **What to capture:** The modal popup showing:
  - Form fields: Student Name, Email Address, Department dropdown, Year of Study dropdown, and CGPA.
  - Type sample details into the fields (e.g., `Divya Ramesh`, `divya.ramesh@college.edu`, `Computer Science`, `Year 2`, `8.90`).
- **Save as:** `03_create_student_modal.png`

---

### Screenshot 4: Client-Side Form Validation Errors
- **Action:**
  - Clear the fields or enter invalid values:
    - Name: `1234`
    - Email: `invalid-email`
    - CGPA: `14.50`
  - Click **"Save Student"**.
- **What to capture:** The red validation alerts under the input fields highlighting:
  - *"Please enter a valid email format"*
  - *"CGPA must be between 0.00 and 10.00"*
  - *"Name can only contain letters, spaces, dots, and hyphens"*
- **Save as:** `04_client_validation_error.png`

---

### Screenshot 5: Success Toast Notification
- **Action:** Enter valid details in the Add form and click **"Save Student"**.
- **What to capture:** The green floating toast notification that pops up in the bottom-right corner:
  - *"Student Divya Ramesh was successfully created!"*
- **Save as:** `05_success_toast_notification.png`

---

### Screenshot 6: View Student Profile Details
- **Action:** Click the **eye icon** (`👁️`) on any student row in the table.
- **What to capture:** The profile modal displaying:
  - Circular avatar with initials (e.g. "DR")
  - Student Name, Email, ID, Department, Year of Study, CGPA, and Enrollment Date.
- **Save as:** `06_view_student_profile.png`

---

### Screenshot 7: Edit Student Modal Form
- **Action:** Click the **pencil icon** (`✏️`) on any student row.
- **What to capture:** The Edit Student modal showing the title *"Edit Student #..."* with existing values pre-populated in the form.
- **Save as:** `07_edit_student_modal.png`

---

### Screenshot 8: Delete Confirmation Modal
- **Action:** Click the **trash icon** (`🗑️`) on any student row.
- **What to capture:** The red-accented confirmation modal asking:
  - *"Are you sure you want to permanently delete student ... (ID: ...)? This operation cannot be undone."*
- **Save as:** `08_delete_confirmation_modal.png`

---

### Screenshot 9: Search and Filter in Action
- **Action:**
  - Type a name into the search bar (e.g. `Priya`), OR select a specific department (e.g. `Computer Science`).
- **What to capture:** The table dynamically updating to show only the matching student(s), and the "Filtered Results" stat card showing the filtered count.
- **Save as:** `09_search_filter_in_action.png`

---

### Screenshot 10: Mobile Responsive View
- **Action:**
  - In your browser (Chrome or Edge), press **F12** (Developer Tools).
  - Click the **Device Toggle** icon (or press `Ctrl + Shift + M`).
  - Select **iPhone 14** or **Pixel 7** (approx. 390px - 412px wide).
- **What to capture:** The layout stacking gracefully on mobile:
  - Header adapting vertically
  - Metric cards stacking in 1 column
  - Table scrolling horizontally with touch responsiveness.
- **Save as:** `10_mobile_responsive_view.png`

---

### Screenshot 11: Postman - Successful API Test (201 Created or 200 OK)
- **Action:**
  - Open Postman and import `postman/Student_Management_API.postman_collection.json`.
  - Open the request **"1. Create Student (Valid Data)"** and click **Send**.
- **What to capture:** The Postman window showing:
  - URL: `POST http://127.0.0.1:8000/api/students/`
  - Status: `201 Created`
  - Response Body JSON with `"success": true`
  - "Test Results" tab showing `PASS Status code is 201 Created`.
- **Save as:** `11_postman_crud_tests.png`

---

### Screenshot 12: Postman - Server Validation Error (400 Bad Request)
- **Action:**
  - In Postman, open request **"3. Create Student (Duplicate Email)"** and click **Send**.
- **What to capture:**
  - Status: `400 Bad Request`
  - Response Body showing `"errors": {"email": ["Student with this email already exists."]}`.
- **Save as:** `12_postman_validation_error.png`

---

### Screenshot 13: Django Automated Unit Test Suite
- **Action:**
  - In PowerShell terminal, run:
    ```powershell
    .\venv\Scripts\python.exe backend\manage.py test students
    ```
- **What to capture:** The terminal output showing:
  ```text
  Found 21 test(s).
  .....................
  Ran 21 tests in 0.098s
  OK
  ```
- **Save as:** `13_django_automated_tests.png`

---

### Screenshot 14: Git Commit History
- **Action:**
  - In PowerShell terminal, run:
    ```powershell
    git log --oneline -n 5
    ```
- **What to capture:** The terminal output showing meaningful commit messages:
  - `feat: complete student management CRUD web application satisfying college SOP requirements`
  - `fix: refine 404 handling in update, relative asset links, and safe delete parsing`
  - `feat: add 1-click Windows runner script run_server.bat`
- **Save as:** `14_git_commit_history.png`

---

## 📁 Where to Store the Screenshots
Create a folder named `screenshots/` inside your project directory:
`c:\Users\M.R.KANISHKAA\Documents\Student-Management-CRUD\screenshots\`
Save your 14 PNG files there. You can then insert them into your project report document or print them out for evaluation.
