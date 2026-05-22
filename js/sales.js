// ==================== SALES MODULE ====================
// Tracks milk and product sales

const Sales = (() => {
    const SALES_COLLECTION = 'sales';
    let allSales = [];

    function init() {
        setupEventListeners();
        loadSales();
    }

    function setupEventListeners() {
        const addBtn = document.getElementById('add-sale-btn');
        const form = document.getElementById('sale-form');
        const cancelBtn = document.getElementById('cancel-sale-btn');

        if (addBtn) addBtn.addEventListener('click', showForm);
        if (form) form.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', hideForm);
    }

    function showForm() {
        const container = document.getElementById('sale-form-container');
        if (container) {
            container.classList.remove('hidden');
            document.getElementById('sale-form').reset();
            document.getElementById('sale-date').valueAsDate = new Date();
        }
    }

    function hideForm() {
        const container = document.getElementById('sale-form-container');
        if (container) container.classList.add('hidden');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const quantity = parseFloat(document.getElementById('sale-quantity').value);
        const unitPrice = parseFloat(document.getElementById('sale-unit-price').value);
        const totalAmount = quantity * unitPrice;

        const data = {
            product: document.getElementById('sale-product').value,
            date: document.getElementById('sale-date').value,
            quantity: quantity,
            unitPrice: unitPrice,
            totalAmount: totalAmount,
            buyer: document.getElementById('sale-buyer').value,
            createdAt: new Date().toISOString()
        };

        if (!data.product || !data.date || !data.quantity || !data.unitPrice) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Saving sale record...');
            const db = getDb();
            if (!db) {
                data.id = generateId();
                allSales.push(data);
                Storage.set(SALES_COLLECTION, allSales);
            } else {
                const docRef = await db.collection(SALES_COLLECTION).add(data);
                data.id = docRef.id;
                allSales.push(data);
            }
            hideLoader();
            showNotification(`Sale recorded! Income: KES ${totalAmount.toFixed(2)}`, 'success');
            hideForm();
            renderSales();
            updateSalesStats();
            updateDashboard();
        } catch (error) {
            hideLoader();
            showNotification('Error saving sale', 'error');
        }
    }

    async function loadSales() {
        try {
            const db = getDb();
            if (!db) {
                allSales = Storage.get(SALES_COLLECTION, []);
            } else {
                const snapshot = await db.collection(SALES_COLLECTION).orderBy('createdAt', 'desc').get();
                allSales = [];
                snapshot.forEach(doc => {
                    allSales.push({ id: doc.id, ...doc.data() });
                });
            }
            renderSales();
            updateSalesStats();
        } catch (error) {
            allSales = Storage.get(SALES_COLLECTION, []);
            renderSales();
        }
    }

    function renderSales() {
        const list = document.getElementById('sales-list');
        if (!list) return;

        if (allSales.length === 0) {
            list.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No sales recorded yet.</p>';
            return;
        }

        list.innerHTML = allSales.map(sale => `
            <div class="list-item">
                <div class="list-item-info">
                    <div class="list-item-title">💰 ${sale.product.toUpperCase()}</div>
                    <div class="list-item-details">
                        Date: ${formatDate(sale.date)} | 
                        Qty: ${sale.quantity} | 
                        Price: KES ${sale.unitPrice.toFixed(2)}
                    </div>
                    <div class="list-item-details" style="margin-top: 5px; font-weight: 600; color: #27ae60;">
                        Total: KES ${sale.totalAmount.toFixed(2)}
                    </div>
                    ${sale.buyer ? `<div class="list-item-details">Buyer: ${sale.buyer}</div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-danger" onclick="Sales.deleteRecord('${sale.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function updateSalesStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const totalIncome = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const monthlyIncome = allSales
            .filter(s => new Date(s.date) >= startOfMonth && new Date(s.date) <= today)
            .reduce((sum, s) => sum + s.totalAmount, 0);

        const totalEl = document.getElementById('total-income');
        const monthlyEl = document.getElementById('monthly-income');

        if (totalEl) totalEl.textContent = `KES ${totalIncome.toFixed(2)}`;
        if (monthlyEl) monthlyEl.textContent = `KES ${monthlyIncome.toFixed(2)}`;
    }

    async function deleteRecord(recordId) {
        if (confirm('Delete this sale record?')) {
            try {
                const db = getDb();
                if (!db) {
                    allSales = allSales.filter(r => r.id !== recordId);
                    Storage.set(SALES_COLLECTION, allSales);
                } else {
                    await db.collection(SALES_COLLECTION).doc(recordId).delete();
                    allSales = allSales.filter(r => r.id !== recordId);
                }
                showNotification('Record deleted', 'success');
                renderSales();
                updateSalesStats();
            } catch (error) {
                showNotification('Error deleting record', 'error');
            }
        }
    }

    function getTotalIncome() {
        return allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    }

    function getMonthlyIncome() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return allSales
            .filter(s => new Date(s.date) >= startOfMonth && new Date(s.date) <= today)
            .reduce((sum, s) => sum + s.totalAmount, 0);
    }

    function getAll() {
        return allSales;
    }

    return {
        init, showForm, hideForm, deleteRecord, getTotalIncome, getMonthlyIncome, getAll, loadSales, renderSales, updateSalesStats
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Sales.init();
});
