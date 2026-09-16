/**
 * Student Management System - Full-Stack CRUD Application
 * Vanilla JavaScript Frontend Architecture
 *
 * Handles:
 * - REST API Communication (Fetch API)
 * - State Management
 * - Client-Side Validation
 * - Search & Filter Dynamic Querying
 * - Modal Operations (Create, View, Edit, Delete)
 * - Toast Notifications & Network Error Handling
 */

// ==========================================================================
// 1. Configuration & Global State
// ==========================================================================

// Determine API base URL automatically based on how the page is loaded
const API_BASE_URL = (() => {
    const origin = window.location.origin;
    if (origin.includes('127.0.0.1:8000') || origin.includes('localhost:8000')) {
        return `${origin}/api/students/`;
    }
    // Default fallback when running via Live Server or file protocol
    return 'http://127.0.0.1:8000/api/students/';
})();

const state = {
    students: [],
    filteredCount: 0,
    currentView: 'table', // 'table' or 'card'
    activeEditId: null,
    pendingDeleteStudent: null,
    isBackendOnline: true,
    searchDebounceTimer: null
};

// ==========================================================================
// 2. DOM Element Selectors
// ==========================================================================

const DOM = {
    // Banner & Connection
    connectionBanner: document.getElementById('connectionBanner'),
    apiUrlDisplay: document.getElementById('apiUrlDisplay'),
    retryConnectionBtn: document.getElementById('retryConnectionBtn'),
    serverStatusBadge: document.getElementById('serverStatusBadge'),

    // Statistics
    statTotalStudents: document.getElementById('statTotalStudents'),
    statAvgCgpa: document.getElementById('statAvgCgpa'),
    statDepts: document.getElementById('statDepts'),
    statFilteredCount: document.getElementById('statFilteredCount'),

    // Search & Filter Controls
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    departmentFilter: document.getElementById('departmentFilter'),
    yearFilter: document.getElementById('yearFilter'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    refreshBtn: document.getElementById('refreshBtn'),

    // View Toggles
    tableViewBtn: document.getElementById('tableViewBtn'),
    cardViewBtn: document.getElementById('cardViewBtn'),
    tableWrapper: document.getElementById('tableWrapper'),
    cardGridWrapper: document.getElementById('cardGridWrapper'),
    studentTableBody: document.getElementById('studentTableBody'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateText: document.getElementById('emptyStateText'),
    emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),
    loadingState: document.getElementById('loadingState'),

    // Add / Edit Modal & Form
    studentModal: document.getElementById('studentModal'),
    modalTitle: document.getElementById('modalTitle'),
    studentForm: document.getElementById('studentForm'),
    studentId: document.getElementById('studentId'),
    studentName: document.getElementById('studentName'),
    studentEmail: document.getElementById('studentEmail'),
    studentDepartment: document.getElementById('studentDepartment'),
    studentYear: document.getElementById('studentYear'),
    studentCgpa: document.getElementById('studentCgpa'),
    saveStudentBtn: document.getElementById('saveStudentBtn'),
    saveBtnText: document.getElementById('saveBtnText'),
    formErrorAlert: document.getElementById('formErrorAlert'),
    formErrorAlertMsg: document.getElementById('formErrorAlertMsg'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    closeStudentModalBtn: document.getElementById('closeStudentModalBtn'),
    cancelStudentModalBtn: document.getElementById('cancelStudentModalBtn'),

    // Field Error Placeholders
    nameError: document.getElementById('nameError'),
    emailError: document.getElementById('emailError'),
    departmentError: document.getElementById('departmentError'),
    yearError: document.getElementById('yearError'),
    cgpaError: document.getElementById('cgpaError'),

    // View Profile Modal
    viewModal: document.getElementById('viewModal'),
    viewAvatar: document.getElementById('viewAvatar'),
    viewName: document.getElementById('viewName'),
    viewEmail: document.getElementById('viewEmail'),
    viewId: document.getElementById('viewId'),
    viewDepartment: document.getElementById('viewDepartment'),
    viewYear: document.getElementById('viewYear'),
    viewCgpa: document.getElementById('viewCgpa'),
    viewCreatedAt: document.getElementById('viewCreatedAt'),
    closeViewModalBtn: document.getElementById('closeViewModalBtn'),
    closeViewModalFooterBtn: document.getElementById('closeViewModalFooterBtn'),
    editFromViewBtn: document.getElementById('editFromViewBtn'),

    // Delete Confirmation Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteStudentName: document.getElementById('deleteStudentName'),
    deleteStudentId: document.getElementById('deleteStudentId'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
};

// Set API URL in warning banner
if (DOM.apiUrlDisplay) {
    DOM.apiUrlDisplay.textContent = API_BASE_URL;
}

// ==========================================================================
// 3. Toast Notification Helper
// ==========================================================================

/**
 * Displays a non-blocking toast notification.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'warning'|'info'} type - Toast theme
 * @param {number} duration - Auto-dismiss timeout in ms
 */
function showToast(message, type = 'success', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || 'fa-bell'} toast-icon"></i>
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

// Helper to escape HTML characters
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// 4. REST API Service Calls
// ==========================================================================

/**
 * Update connection banner status
 */
function updateConnectionStatus(isOnline) {
    state.isBackendOnline = isOnline;
    if (isOnline) {
        DOM.connectionBanner.classList.add('hidden');
        DOM.serverStatusBadge.className = 'badge badge-success';
        DOM.serverStatusBadge.innerHTML = '<span class="status-dot"></span> Backend Connected';
    } else {
        DOM.connectionBanner.classList.remove('hidden');
        DOM.serverStatusBadge.className = 'badge';
        DOM.serverStatusBadge.style.backgroundColor = '#fee2e2';
        DOM.serverStatusBadge.style.color = '#991b1b';
        DOM.serverStatusBadge.innerHTML = '<span class="status-dot" style="background-color: #ef4444;"></span> Server Offline';
    }
}

/**
 * Fetch all students with active search and filter parameters
 */
async function loadStudents() {
    DOM.loadingState.classList.remove('hidden');
    DOM.emptyState.classList.add('hidden');

    const search = DOM.searchInput.value.trim();
    const department = DOM.departmentFilter.value;
    const year = DOM.yearFilter.value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (year) params.append('year', year);

    const url = `${API_BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const json = await response.json();
        updateConnectionStatus(true);

        state.students = json.data || [];
        state.filteredCount = json.count || 0;

        renderRecords();
        loadDashboardStats();
    } catch (err) {
        console.error('Error fetching students:', err);
        updateConnectionStatus(false);
        showToast('Unable to connect to Django backend server. Please verify it is running on port 8000.', 'error');
        renderRecords(); // Will show empty state
    } finally {
        DOM.loadingState.classList.add('hidden');
    }
}

/**
 * Fetch aggregated dashboard statistics from /api/students/stats/
 */
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}stats/`);
        if (response.ok) {
            const json = await response.json();
            const stats = json.data;
            DOM.statTotalStudents.textContent = stats.total_students;
            DOM.statAvgCgpa.textContent = Number(stats.average_cgpa).toFixed(2);
            DOM.statDepts.textContent = stats.department_counts.length;
            DOM.statFilteredCount.textContent = state.students.length;
        }
    } catch (e) {
        // Fallback calculation using local list if stats endpoint fails
        DOM.statTotalStudents.textContent = state.students.length;
        DOM.statFilteredCount.textContent = state.students.length;
        if (state.students.length > 0) {
            const totalCgpa = state.students.reduce((acc, s) => acc + parseFloat(s.cgpa || 0), 0);
            DOM.statAvgCgpa.textContent = (totalCgpa / state.students.length).toFixed(2);
            const depts = new Set(state.students.map(s => s.department));
            DOM.statDepts.textContent = depts.size;
        } else {
            DOM.statAvgCgpa.textContent = "0.00";
            DOM.statDepts.textContent = "0";
        }
    }
}

/**
 * Retrieve a single student by ID
 */
async function getStudentById(id) {
    const response = await fetch(`${API_BASE_URL}${id}/`);
    if (!response.ok) {
        throw new Error(`Student #${id} not found.`);
    }
    const json = await response.json();
    return json.data;
}

/**
 * Create a new student (POST /api/students/)
 */
async function createStudent(payload) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const json = await response.json();
    return { ok: response.ok, status: response.status, data: json };
}

/**
 * Update an existing student (PUT /api/students/{id}/)
 */
async function updateStudent(id, payload) {
    const response = await fetch(`${API_BASE_URL}${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const json = await response.json();
    return { ok: response.ok, status: response.status, data: json };
}

/**
 * Delete a student (DELETE /api/students/{id}/)
 */
async function deleteStudent(id) {
    const response = await fetch(`${API_BASE_URL}${id}/`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    });
    let json = {};
    if (response.status !== 204) {
        try {
            json = await response.json();
        } catch (e) {
            json = {};
        }
    }
    return { ok: response.ok, status: response.status, data: json };
}

// ==========================================================================
// 5. Client-Side Validation Logic (SOP Section 9)
// ==========================================================================

function clearErrors() {
    DOM.formErrorAlert.classList.add('hidden');
    const errorSpans = [
        DOM.nameError,
        DOM.emailError,
        DOM.departmentError,
        DOM.yearError,
        DOM.cgpaError
    ];
    errorSpans.forEach(span => {
        if (span) span.textContent = '';
    });

    const inputs = [
        DOM.studentName,
        DOM.studentEmail,
        DOM.studentDepartment,
        DOM.studentYear,
        DOM.studentCgpa
    ];
    inputs.forEach(input => {
        if (input) input.classList.remove('input-invalid');
    });
}

function setFieldError(fieldElement, errorSpan, message) {
    if (fieldElement) fieldElement.classList.add('input-invalid');
    if (errorSpan) errorSpan.textContent = message;
}

/**
 * Comprehensive client-side validation
 */
function validateStudentForm() {
    clearErrors();
    let isValid = true;

    // 1. Name validation
    const name = DOM.studentName.value.trim();
    if (!name) {
        setFieldError(DOM.studentName, DOM.nameError, 'Student name is required.');
        isValid = false;
    } else if (name.length < 2) {
        setFieldError(DOM.studentName, DOM.nameError, 'Name must be at least 2 characters long.');
        isValid = false;
    } else if (!/^[A-Za-z\s\.\-']+$/.test(name)) {
        setFieldError(DOM.studentName, DOM.nameError, 'Name can only contain letters, spaces, dots, and hyphens.');
        isValid = false;
    }

    // 2. Email validation
    const email = DOM.studentEmail.value.trim();
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!email) {
        setFieldError(DOM.studentEmail, DOM.emailError, 'Email address is required.');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        setFieldError(DOM.studentEmail, DOM.emailError, 'Please enter a valid email format (e.g. name@college.edu).');
        isValid = false;
    }

    // 3. Department validation
    const dept = DOM.studentDepartment.value.trim();
    if (!dept) {
        setFieldError(DOM.studentDepartment, DOM.departmentError, 'Please select an academic department.');
        isValid = false;
    }

    // 4. Year validation (1 to 4)
    const yearVal = DOM.studentYear.value;
    if (!yearVal) {
        setFieldError(DOM.studentYear, DOM.yearError, 'Please select year of study.');
        isValid = false;
    } else {
        const yearInt = parseInt(yearVal, 10);
        if (isNaN(yearInt) || yearInt < 1 || yearInt > 4) {
            setFieldError(DOM.studentYear, DOM.yearError, 'Academic year must be between 1 and 4.');
            isValid = false;
        }
    }

    // 5. CGPA validation (0.00 to 10.00)
    const cgpaVal = DOM.studentCgpa.value.trim();
    if (!cgpaVal) {
        setFieldError(DOM.studentCgpa, DOM.cgpaError, 'CGPA is required.');
        isValid = false;
    } else {
        const cgpaFloat = parseFloat(cgpaVal);
        if (isNaN(cgpaFloat)) {
            setFieldError(DOM.studentCgpa, DOM.cgpaError, 'CGPA must be a valid number.');
            isValid = false;
        } else if (cgpaFloat < 0.0 || cgpaFloat > 10.0) {
            setFieldError(DOM.studentCgpa, DOM.cgpaError, 'CGPA must be between 0.00 and 10.00.');
            isValid = false;
        }
    }

    if (!isValid) {
        DOM.formErrorAlertMsg.textContent = 'Please correct the highlighted errors before saving.';
        DOM.formErrorAlert.classList.remove('hidden');
    }

    return isValid;
}

/**
 * Handle server-side validation errors and map back to inputs
 */
function handleServerValidationErrors(errors) {
    clearErrors();
    let hasFieldErrors = false;

    if (errors.name) {
        setFieldError(DOM.studentName, DOM.nameError, Array.isArray(errors.name) ? errors.name[0] : errors.name);
        hasFieldErrors = true;
    }
    if (errors.email) {
        setFieldError(DOM.studentEmail, DOM.emailError, Array.isArray(errors.email) ? errors.email[0] : errors.email);
        hasFieldErrors = true;
    }
    if (errors.department) {
        setFieldError(DOM.studentDepartment, DOM.departmentError, Array.isArray(errors.department) ? errors.department[0] : errors.department);
        hasFieldErrors = true;
    }
    if (errors.year) {
        setFieldError(DOM.studentYear, DOM.yearError, Array.isArray(errors.year) ? errors.year[0] : errors.year);
        hasFieldErrors = true;
    }
    if (errors.cgpa) {
        setFieldError(DOM.studentCgpa, DOM.cgpaError, Array.isArray(errors.cgpa) ? errors.cgpa[0] : errors.cgpa);
        hasFieldErrors = true;
    }

    if (errors.non_field_errors) {
        DOM.formErrorAlertMsg.textContent = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
        DOM.formErrorAlert.classList.remove('hidden');
    } else if (hasFieldErrors) {
        DOM.formErrorAlertMsg.textContent = 'Server validation failed. Please check the marked fields.';
        DOM.formErrorAlert.classList.remove('hidden');
    }
}

// ==========================================================================
// 6. UI Rendering (Table & Cards)
// ==========================================================================

function getCgpaClass(cgpa) {
    const val = parseFloat(cgpa);
    if (val >= 8.5) return 'cgpa-high';
    if (val >= 6.5) return 'cgpa-mid';
    return 'cgpa-low';
}

function renderRecords() {
    const students = state.students;

    if (students.length === 0) {
        DOM.tableWrapper.classList.add('hidden');
        DOM.cardGridWrapper.classList.add('hidden');
        DOM.emptyState.classList.remove('hidden');

        const isFiltering = DOM.searchInput.value || DOM.departmentFilter.value || DOM.yearFilter.value;
        if (isFiltering) {
            DOM.emptyStateTitle.textContent = "No Matching Students Found";
            DOM.emptyStateText.textContent = "Try clearing or modifying your search and filter criteria.";
        } else {
            DOM.emptyStateTitle.textContent = "No Students in Database";
            DOM.emptyStateText.textContent = "The database is currently empty. Click 'Add Student' to get started.";
        }
        return;
    }

    DOM.emptyState.classList.add('hidden');

    if (state.currentView === 'table') {
        DOM.tableWrapper.classList.remove('hidden');
        DOM.cardGridWrapper.classList.add('hidden');
        renderTable(students);
    } else {
        DOM.tableWrapper.classList.add('hidden');
        DOM.cardGridWrapper.classList.remove('hidden');
        renderCards(students);
    }
}

function renderTable(students) {
    DOM.studentTableBody.innerHTML = students.map(student => `
        <tr data-id="${student.id}">
            <td><strong>#${student.id}</strong></td>
            <td>
                <div class="student-name-cell">${escapeHtml(student.name)}</div>
            </td>
            <td>${escapeHtml(student.email)}</td>
            <td>
                <span class="dept-pill">${escapeHtml(student.department)}</span>
            </td>
            <td>
                <span class="year-badge"><i class="fa-solid fa-graduation-cap"></i> Year ${student.year}</span>
            </td>
            <td>
                <span class="cgpa-badge ${getCgpaClass(student.cgpa)}">${parseFloat(student.cgpa).toFixed(2)}</span>
            </td>
            <td style="text-align: center;">
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="openViewModal(${student.id})" title="View Details">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="openEditModal(${student.id})" title="Edit Student">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="openDeleteModal(${student.id}, '${escapeHtml(student.name)}')" title="Delete Student">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCards(students) {
    DOM.cardGridWrapper.innerHTML = students.map(student => `
        <div class="student-card" data-id="${student.id}">
            <div class="card-top">
                <div>
                    <h4 class="card-name">${escapeHtml(student.name)}</h4>
                    <p class="card-email">${escapeHtml(student.email)}</p>
                </div>
                <span class="cgpa-badge ${getCgpaClass(student.cgpa)}">${parseFloat(student.cgpa).toFixed(2)} CGPA</span>
            </div>
            <div class="card-meta">
                <span class="dept-pill"><i class="fa-solid fa-building-columns"></i> ${escapeHtml(student.department)}</span>
                <span class="year-badge"><i class="fa-solid fa-calendar"></i> Year ${student.year}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-secondary text-sm" onclick="openViewModal(${student.id})">
                    <i class="fa-solid fa-eye"></i> View
                </button>
                <button class="btn btn-secondary text-sm" onclick="openEditModal(${student.id})">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="btn btn-secondary text-sm" style="color: var(--danger);" onclick="openDeleteModal(${student.id}, '${escapeHtml(student.name)}')">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================================================
// 7. Modal Handlers (Create, Edit, View, Delete)
// ==========================================================================

// --- Modal 1: Add / Edit ---
function openAddModal() {
    state.activeEditId = null;
    DOM.studentForm.reset();
    DOM.studentId.value = '';
    DOM.modalTitle.textContent = 'Add New Student';
    DOM.saveBtnText.innerHTML = '<i class="fa-solid fa-check"></i> Add Student';
    clearErrors();
    DOM.studentModal.classList.remove('hidden');
    DOM.studentName.focus();
}

async function openEditModal(id) {
    try {
        const student = await getStudentById(id);
        state.activeEditId = id;
        DOM.studentId.value = student.id;
        DOM.studentName.value = student.name;
        DOM.studentEmail.value = student.email;
        DOM.studentDepartment.value = student.department;
        DOM.studentYear.value = student.year;
        DOM.studentCgpa.value = student.cgpa;

        DOM.modalTitle.textContent = `Edit Student #${student.id}`;
        DOM.saveBtnText.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
        clearErrors();

        // If view modal was open, close it
        closeViewModal();

        DOM.studentModal.classList.remove('hidden');
        DOM.studentName.focus();
    } catch (err) {
        showToast('Error loading student details for editing.', 'error');
    }
}

function closeStudentModal() {
    DOM.studentModal.classList.add('hidden');
    DOM.studentForm.reset();
    clearErrors();
    state.activeEditId = null;
}

// Form Submit Handler (Handles both Create and Update)
async function handleStudentFormSubmit(e) {
    e.preventDefault();

    if (!validateStudentForm()) {
        return;
    }

    const payload = {
        name: DOM.studentName.value.trim(),
        email: DOM.studentEmail.value.trim().toLowerCase(),
        department: DOM.studentDepartment.value.trim(),
        year: parseInt(DOM.studentYear.value, 10),
        cgpa: parseFloat(DOM.studentCgpa.value)
    };

    // Toggle loading spinner inside save button
    const spinner = DOM.saveStudentBtn.querySelector('.btn-spinner');
    spinner.classList.remove('hidden');
    DOM.saveStudentBtn.disabled = true;

    try {
        let result;
        if (state.activeEditId) {
            // Update Operation (PUT)
            result = await updateStudent(state.activeEditId, payload);
        } else {
            // Create Operation (POST)
            result = await createStudent(payload);
        }

        if (result.ok) {
            closeStudentModal();
            const actionVerb = state.activeEditId ? 'updated' : 'created';
            showToast(`Student ${payload.name} was successfully ${actionVerb}!`, 'success');
            await loadStudents();
        } else {
            if (result.data && result.data.errors) {
                handleServerValidationErrors(result.data.errors);
            } else {
                showToast(result.data.message || 'Operation failed. Please try again.', 'error');
            }
        }
    } catch (err) {
        showToast('Network error while communicating with backend.', 'error');
    } finally {
        spinner.classList.add('hidden');
        DOM.saveStudentBtn.disabled = false;
    }
}

// --- Modal 2: View Student Profile ---
async function openViewModal(id) {
    try {
        const student = await getStudentById(id);

        // Generate avatar initials (e.g. "Aarav Sharma" -> "AS")
        const initials = student.name
            .split(' ')
            .filter(Boolean)
            .map(n => n[0].toUpperCase())
            .slice(0, 2)
            .join('');

        DOM.viewAvatar.textContent = initials || 'ST';
        DOM.viewName.textContent = student.name;
        DOM.viewEmail.textContent = student.email;
        DOM.viewId.textContent = `#${student.id}`;
        DOM.viewDepartment.textContent = student.department;
        DOM.viewYear.textContent = `Year ${student.year} of 4`;
        DOM.viewCgpa.textContent = `${parseFloat(student.cgpa).toFixed(2)} / 10.00`;

        const createdDate = student.created_at
            ? new Date(student.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A';
        DOM.viewCreatedAt.textContent = createdDate;

        DOM.editFromViewBtn.onclick = () => openEditModal(student.id);

        DOM.viewModal.classList.remove('hidden');
    } catch (err) {
        showToast('Unable to view student profile.', 'error');
    }
}

function closeViewModal() {
    DOM.viewModal.classList.add('hidden');
}

// --- Modal 3: Delete Confirmation ---
function openDeleteModal(id, name) {
    state.pendingDeleteStudent = { id, name };
    DOM.deleteStudentName.textContent = name;
    DOM.deleteStudentId.textContent = `#${id}`;
    DOM.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    DOM.deleteModal.classList.add('hidden');
    state.pendingDeleteStudent = null;
}

async function handleConfirmDelete() {
    if (!state.pendingDeleteStudent) return;

    const { id, name } = state.pendingDeleteStudent;
    const spinner = DOM.confirmDeleteBtn.querySelector('.btn-spinner');
    spinner.classList.remove('hidden');
    DOM.confirmDeleteBtn.disabled = true;

    try {
        const result = await deleteStudent(id);
        if (result.ok) {
            closeDeleteModal();
            showToast(`Student ${name} (#${id}) has been removed.`, 'success');
            await loadStudents();
        } else {
            showToast(result.data.message || 'Failed to delete student.', 'error');
        }
    } catch (err) {
        showToast('Network error while attempting to delete student.', 'error');
    } finally {
        spinner.classList.add('hidden');
        DOM.confirmDeleteBtn.disabled = false;
    }
}

// ==========================================================================
// 8. Event Listeners & Initialization
// ==========================================================================

function setupEventListeners() {
    // Open Add Modal
    DOM.openAddModalBtn.addEventListener('click', openAddModal);
    DOM.emptyStateAddBtn.addEventListener('click', openAddModal);

    // Close Modals
    DOM.closeStudentModalBtn.addEventListener('click', closeStudentModal);
    DOM.cancelStudentModalBtn.addEventListener('click', closeStudentModal);
    DOM.closeViewModalBtn.addEventListener('click', closeViewModal);
    DOM.closeViewModalFooterBtn.addEventListener('click', closeViewModal);
    DOM.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    DOM.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    // Backdrop click to close modals
    [DOM.studentModal, DOM.viewModal, DOM.deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Form Submit
    DOM.studentForm.addEventListener('submit', handleStudentFormSubmit);

    // Confirm Delete
    DOM.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Live Debounced Search
    DOM.searchInput.addEventListener('input', () => {
        if (DOM.searchInput.value.trim()) {
            DOM.clearSearchBtn.classList.remove('hidden');
        } else {
            DOM.clearSearchBtn.classList.add('hidden');
        }

        clearTimeout(state.searchDebounceTimer);
        state.searchDebounceTimer = setTimeout(() => {
            loadStudents();
        }, 300);
    });

    // Clear Search button
    DOM.clearSearchBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        DOM.clearSearchBtn.classList.add('hidden');
        loadStudents();
    });

    // Filter Change Listeners
    DOM.departmentFilter.addEventListener('change', () => loadStudents());
    DOM.yearFilter.addEventListener('change', () => loadStudents());

    // Reset Filters button
    DOM.resetFiltersBtn.addEventListener('click', () => {
        DOM.searchInput.value = '';
        DOM.clearSearchBtn.classList.add('hidden');
        DOM.departmentFilter.value = '';
        DOM.yearFilter.value = '';
        loadStudents();
    });

    // Refresh button
    DOM.refreshBtn.addEventListener('click', () => {
        loadStudents();
        showToast('Student records refreshed.', 'info');
    });

    // Retry connection banner button
    DOM.retryConnectionBtn.addEventListener('click', () => {
        loadStudents();
    });

    // View Toggles (Table vs Card)
    DOM.tableViewBtn.addEventListener('click', () => {
        state.currentView = 'table';
        DOM.tableViewBtn.classList.add('active');
        DOM.cardViewBtn.classList.remove('active');
        renderRecords();
    });

    DOM.cardViewBtn.addEventListener('click', () => {
        state.currentView = 'card';
        DOM.cardViewBtn.classList.add('active');
        DOM.tableViewBtn.classList.remove('active');
        renderRecords();
    });

    // Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStudentModal();
            closeViewModal();
            closeDeleteModal();
        }
    });
}

// Expose modal open methods globally so inline HTML onclick attributes work
window.openViewModal = openViewModal;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadStudents();
});
