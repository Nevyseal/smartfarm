// ==================== EXPENSES MODULE ====================
// Tracks farm expenses and operational costs

const Expenses = (() => {
    const EXPENSES_COLLECTION = 'expenses';
    let allExpenses = [];

    function init() {
        setupEventListeners();
        loadExpenses();
    }

    function setupEventListeners() {
        const addBtn = document.getElementById('add-expense-btn');
        const form = document.getElementById('expense-form');
        const cancelBtn = document.getElementById('cancel-expense-btn');

        if (addBtn) addBtn.addEventListener('click', showForm);
        if (form) form.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', hideForm);
    }

    function showForm() {
        const container = document.getElementById('expense-form-container');
        if (container) {
            container.classList.remove('hidden');
            document.getElementById('expense-form').reset();
            document.getElementById('expense-date').valueAsDate = new Date();
        }
    }

    function hideForm() {
        const container = document.getElementById('expense-form-container');
        if (container) container.classList.add('hidden');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            type: document.getElementById('expense-type').value,
            date: document.getElementById('expense-date').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            category: document.getElementById('expense-category').value,
            notes: document.getElementById('expense-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!data.type || !data.date || !data.amount) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Saving expense...');
            const db = getDb();
            if (!db) {
                data.id = generateId();
                allExpenses.push(data);
                Storage.set(EXPENSES_COLLECTION, allExpenses);
            } else {
                const docRef = await db.collection(EXPENSES_COLLECTION).add(data);
                data.id = docRef.id;
                allExpenses.push(data);
            }
            hideLoader();
            showNotification(`Expense recorded: KES ${data.amount.toFixed(2)}`, 'success');
            hideForm();
            renderExpenses();
            updateExpensesStats();
            updateDashboard();
        } catch (error) {
            hideLoader();
            showNotification('Error saving expense', 'error');
        }
    }

    async function loadExpenses() {
        try {
            const db = getDb();
            if (!db) {
                allExpenses = Storage.get(EXPENSES_COLLECTION, []);
            } else {
                const snapshot = await db.collection(EXPENSES_COLLECTION).orderBy('createdAt', 'desc').get();
                allExpenses = [];
                snapshot.forEach(doc => {
                    allExpenses.push({ id: doc.id, ...doc.data() });
                });
            }
            renderExpenses();
            updateExpensesStats();
        } catch (error) {
            allExpenses = Storage.get(EXPENSES_COLLECTION, []);
            renderExpenses();
        }
    }

    function renderExpenses() {
        const list = document.getElementById('expenses-list');
        if (!list) return;

        if (allExpenses.length === 0) {
            list.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No expenses recorded yet.</p>';
            return;
        }

        const typeEmojis = {
            feed: '🌾',
            medication: '💊',
            maintenance: '🔧',
            labor: '👥',
            transport: '🚚',
            utilities: '⚡',
            other: '📝'
        };

        list.innerHTML = allExpenses.map(expense => `
            <div class="list-item">
                <div class="list-item-info">
                    <div class="list-item-title">${typeEmojis[expense.type] || '📝'} ${expense.type.toUpperCase()}</div>
                    <div class="list-item-details">
                        Date: ${formatDate(expense.date)} | 
                        Amount: KES ${expense.amount.toFixed(2)}
                    </div>
                    ${expense.category ? `<div class="list-item-details">Category: ${expense.category}</div>` : ''}
                    ${expense.notes ? `<div class="list-item-details">Notes: ${expense.notes}</div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-danger" onclick="Expenses.deleteRecord('${expense.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function updateExpensesStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const monthlyExpenses = allExpenses
            .filter(e => new Date(e.date) >= startOfMonth && new Date(e.date) <= today)
            .reduce((sum, e) => sum + e.amount, 0);

        const totalEl = document.getElementById('total-expenses');
        const monthlyEl = document.getElementById('monthly-expenses');

        if (totalEl) totalEl.textContent = `KES ${totalExpenses.toFixed(2)}`;
        if (monthlyEl) monthlyEl.textContent = `KES ${monthlyExpenses.toFixed(2)}`;
    }

    async function deleteRecord(recordId) {
        if (confirm('Delete this expense record?')) {
            try {
                const db = getDb();
                if (!db) {
                    allExpenses = allExpenses.filter(r => r.id !== recordId);
                    Storage.set(EXPENSES_COLLECTION, allExpenses);
                } else {
                    await db.collection(EXPENSES_COLLECTION).doc(recordId).delete();
                    allExpenses = allExpenses.filter(r => r.id !== recordId);
                }
                showNotification('Record deleted', 'success');
                renderExpenses();
                updateExpensesStats();
            } catch (error) {
                showNotification('Error deleting record', 'error');
            }
        }
    }

    function getTotalExpenses() {
        return allExpenses.reduce((sum, e) => sum + e.amount, 0);
    }

    function getMonthlyExpenses() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return allExpenses
            .filter(e => new Date(e.date) >= startOfMonth && new Date(e.date) <= today)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    function getByType(type) {
        return allExpenses.filter(e => e.type === type);
    }

    function getAll() {
        return allExpenses;
    }

    return {
        init, showForm, hideForm, deleteRecord, getTotalExpenses, getMonthlyExpenses, getByType, getAll, loadExpenses, renderExpenses, updateExpensesStats
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Expenses.init();
});
