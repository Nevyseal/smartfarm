// ==================== EMPLOYEES MODULE ====================
// Manages farm staff and employee records

const Employees = (() => {
    const EMPLOYEES_COLLECTION = 'employees';
    let allEmployees = [];

    function init() {
        setupEventListeners();
        loadEmployees();
    }

    function setupEventListeners() {
        const addBtn = document.getElementById('add-employee-btn');
        const form = document.getElementById('employee-form');
        const cancelBtn = document.getElementById('cancel-employee-btn');

        if (addBtn) addBtn.addEventListener('click', showForm);
        if (form) form.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', hideForm);
    }

    function showForm() {
        const container = document.getElementById('employee-form-container');
        if (container) {
            container.classList.remove('hidden');
            document.getElementById('employee-form').reset();
            document.getElementById('employee-hire-date').valueAsDate = new Date();
        }
    }

    function hideForm() {
        const container = document.getElementById('employee-form-container');
        if (container) container.classList.add('hidden');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            name: document.getElementById('employee-name').value,
            role: document.getElementById('employee-role').value,
            hireDate: document.getElementById('employee-hire-date').value,
            salary: parseFloat(document.getElementById('employee-salary').value) || 0,
            phone: document.getElementById('employee-phone').value,
            status: document.getElementById('employee-status').value || 'active',
            notes: document.getElementById('employee-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!data.name || !data.role || !data.hireDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Saving employee record...');
            const db = getDb();
            if (!db) {
                data.id = generateId();
                allEmployees.push(data);
                Storage.set(EMPLOYEES_COLLECTION, allEmployees);
            } else {
                const docRef = await db.collection(EMPLOYEES_COLLECTION).add(data);
                data.id = docRef.id;
                allEmployees.push(data);
            }
            hideLoader();
            showNotification('Employee added successfully!', 'success');
            hideForm();
            renderEmployees();
        } catch (error) {
            hideLoader();
            showNotification('Error saving employee record', 'error');
        }
    }

    async function loadEmployees() {
        try {
            const db = getDb();
            if (!db) {
                allEmployees = Storage.get(EMPLOYEES_COLLECTION, []);
            } else {
                const snapshot = await db.collection(EMPLOYEES_COLLECTION).orderBy('createdAt', 'desc').get();
                allEmployees = [];
                snapshot.forEach(doc => {
                    allEmployees.push({ id: doc.id, ...doc.data() });
                });
            }
            renderEmployees();
        } catch (error) {
            allEmployees = Storage.get(EMPLOYEES_COLLECTION, []);
            renderEmployees();
        }
    }

    function renderEmployees() {
        const list = document.getElementById('employees-list');
        if (!list) return;

        if (allEmployees.length === 0) {
            list.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No employees added yet.</p>';
            return;
        }

        const roleEmojis = {
            manager: '👔',
            milker: '🥛',
            cleaner: '🧹',
            veterinary: '🏥',
            other: '👤'
        };

        list.innerHTML = allEmployees.map(emp => `
            <div class="animal-card">
                <div class="animal-card-header">
                    <div class="animal-card-title">${roleEmojis[emp.role] || '👤'} ${emp.name}</div>
                    <span class="status-badge ${emp.status === 'active' ? 'healthy' : 'danger'}">
                        ${emp.status}
                    </span>
                </div>
                <div class="animal-card-details">
                    <div class="detail-item"><span class="detail-label">Role:</span> ${emp.role}</div>
                    <div class="detail-item"><span class="detail-label">Hired:</span> ${formatDate(emp.hireDate)}</div>
                    ${emp.salary > 0 ? `<div class="detail-item"><span class="detail-label">Salary:</span> KES ${emp.salary.toFixed(2)}/month</div>` : ''}
                    ${emp.phone ? `<div class="detail-item"><span class="detail-label">Phone:</span> ${emp.phone}</div>` : ''}
                    ${emp.notes ? `<div class="detail-item"><span class="detail-label">Notes:</span> ${emp.notes}</div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-primary" onclick="Employees.editEmployee('${emp.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="Employees.deleteRecord('${emp.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async function deleteRecord(empId) {
        if (confirm('Delete this employee record?')) {
            try {
                const db = getDb();
                if (!db) {
                    allEmployees = allEmployees.filter(e => e.id !== empId);
                    Storage.set(EMPLOYEES_COLLECTION, allEmployees);
                } else {
                    await db.collection(EMPLOYEES_COLLECTION).doc(empId).delete();
                    allEmployees = allEmployees.filter(e => e.id !== empId);
                }
                showNotification('Record deleted', 'success');
                renderEmployees();
            } catch (error) {
                showNotification('Error deleting record', 'error');
            }
        }
    }

    function editEmployee(empId) {
        const emp = allEmployees.find(e => e.id === empId);
        if (emp) {
            document.getElementById('employee-name').value = emp.name;
            document.getElementById('employee-role').value = emp.role;
            document.getElementById('employee-hire-date').value = emp.hireDate;
            document.getElementById('employee-salary').value = emp.salary;
            document.getElementById('employee-phone').value = emp.phone || '';
            document.getElementById('employee-status').value = emp.status;
            document.getElementById('employee-notes').value = emp.notes || '';
            
            showForm();
            
            // TODO: Implement update functionality
        }
    }

    function getActive() {
        return allEmployees.filter(e => e.status === 'active');
    }

    function getByRole(role) {
        return allEmployees.filter(e => e.role === role);
    }

    function getTotalMonthlySalaries() {
        return allEmployees.filter(e => e.status === 'active').reduce((sum, e) => sum + (e.salary || 0), 0);
    }

    function getAll() {
        return allEmployees;
    }

    return {
        init, showForm, hideForm, deleteRecord, editEmployee, getActive, getByRole, getTotalMonthlySalaries, getAll, loadEmployees, renderEmployees
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Employees.init();
});
