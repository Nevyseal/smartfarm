// ==================== PRODUCTION MODULE ====================
// Handles milk production tracking (3 times daily: morning, afternoon, evening)

const Production = (() => {
    const PRODUCTION_COLLECTION = 'production';
    let allProduction = [];

    // Initialize module
    function init() {
        setupEventListeners();
        loadProduction();
    }

    // Setup event listeners
    function setupEventListeners() {
        const addProductionBtn = document.getElementById('add-production-btn');
        const productionForm = document.getElementById('production-form');
        const cancelProductionBtn = document.getElementById('cancel-production-btn');

        if (addProductionBtn) {
            addProductionBtn.addEventListener('click', showAddProductionForm);
        }

        if (productionForm) {
            productionForm.addEventListener('submit', handleAddProduction);
        }

        if (cancelProductionBtn) {
            cancelProductionBtn.addEventListener('click', hideAddProductionForm);
        }
    }

    // Show add production form
    function showAddProductionForm() {
        const formContainer = document.getElementById('production-form-container');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            document.getElementById('production-form').reset();
            document.getElementById('production-date').valueAsDate = new Date();
            updateAnimalSelect('production-animal');
        }
    }

    // Hide add production form
    function hideAddProductionForm() {
        const formContainer = document.getElementById('production-form-container');
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
    }

    // Update animal select dropdown
    function updateAnimalSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const animals = Animals.getActive();
        const currentValue = select.value;

        select.innerHTML = '<option value="">Select Animal</option>' +
            animals.map(animal => `
                <option value="${animal.id}">${getAnimalEmoji(animal.type)} ${animal.name}</option>
            `).join('');

        if (currentValue) {
            select.value = currentValue;
        }
    }

    // Handle add production form submission
    async function handleAddProduction(e) {
        e.preventDefault();

        const morning = parseFloat(document.getElementById('production-morning').value) || 0;
        const afternoon = parseFloat(document.getElementById('production-afternoon').value) || 0;
        const evening = parseFloat(document.getElementById('production-evening').value) || 0;
        const total = morning + afternoon + evening;

        const productionData = {
            animalId: document.getElementById('production-animal').value,
            date: document.getElementById('production-date').value,
            morning: morning,
            afternoon: afternoon,
            evening: evening,
            total: total,
            notes: document.getElementById('production-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!productionData.animalId || !productionData.date) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (total === 0) {
            showNotification('Please enter at least one milk production value', 'error');
            return;
        }

        try {
            showLoader('Recording production...');

            const db = getDb();
            if (!db) {
                productionData.id = generateId();
                allProduction.push(productionData);
                Storage.set(PRODUCTION_COLLECTION, allProduction);
            } else {
                const docRef = await db.collection(PRODUCTION_COLLECTION).add(productionData);
                productionData.id = docRef.id;
                allProduction.push(productionData);
            }

            hideLoader();
            showNotification(`Production recorded: ${total}L total milk!`, 'success');
            hideAddProductionForm();
            renderProduction();
            updateProductionStats();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error adding production:', error);
            showNotification('Error recording production', 'error');
        }
    }

    // Load production from database
    async function loadProduction() {
        try {
            const db = getDb();

            if (!db) {
                allProduction = Storage.get(PRODUCTION_COLLECTION, []);
            } else {
                const querySnapshot = await db.collection(PRODUCTION_COLLECTION)
                    .orderBy('createdAt', 'desc')
                    .get();

                allProduction = [];
                querySnapshot.forEach(doc => {
                    allProduction.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            renderProduction();
            updateProductionStats();
        } catch (error) {
            console.error('Error loading production:', error);
            allProduction = Storage.get(PRODUCTION_COLLECTION, []);
            renderProduction();
        }
    }

    // Render production list
    function renderProduction() {
        const productionList = document.getElementById('production-list');

        if (!productionList) return;

        if (allProduction.length === 0) {
            productionList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No production records yet.</p>';
            return;
        }

        productionList.innerHTML = allProduction.map(record => {
            const animal = Animals.getById(record.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown Animal';

            return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">🥛 ${animalName}</div>
                        <div class="list-item-details">
                            Date: ${formatDate(record.date)} | 
                            Morning: ${record.morning}L | 
                            Afternoon: ${record.afternoon}L | 
                            Evening: ${record.evening}L
                        </div>
                        <div class="list-item-details" style="margin-top: 5px; font-weight: 600; color: #2ecc71;">
                            Total: ${record.total}L
                        </div>
                        ${record.notes ? `<div class="list-item-details">Notes: ${record.notes}</div>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-danger" onclick="Production.deleteProduction('${record.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update production statistics
    function updateProductionStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Calculate average daily production
        const last7Days = allProduction.filter(p => {
            const prodDate = new Date(p.date);
            const daysDiff = daysBetween(prodDate, today);
            return daysDiff <= 7 && daysDiff >= 0;
        });

        const avgDaily = last7Days.length > 0 
            ? (last7Days.reduce((sum, p) => sum + p.total, 0) / last7Days.length).toFixed(2)
            : 0;

        // Calculate total monthly production
        const thisMonth = allProduction.filter(p => {
            const prodDate = new Date(p.date);
            return prodDate >= startOfMonth && prodDate <= today;
        });

        const monthlyTotal = thisMonth.reduce((sum, p) => sum + p.total, 0).toFixed(2);

        // Update UI
        const avgElement = document.getElementById('avg-daily-production');
        const monthlyElement = document.getElementById('total-monthly-production');

        if (avgElement) avgElement.textContent = avgDaily + 'L';
        if (monthlyElement) monthlyElement.textContent = monthlyTotal + 'L';
    }

    // Delete production record
    async function deleteProduction(productionId) {
        if (confirm('Are you sure you want to delete this production record?')) {
            try {
                const db = getDb();

                if (!db) {
                    allProduction = allProduction.filter(p => p.id !== productionId);
                    Storage.set(PRODUCTION_COLLECTION, allProduction);
                } else {
                    await db.collection(PRODUCTION_COLLECTION).doc(productionId).delete();
                    allProduction = allProduction.filter(p => p.id !== productionId);
                }

                showNotification('Production record deleted', 'success');
                renderProduction();
                updateProductionStats();
                updateDashboard();
            } catch (error) {
                console.error('Error deleting production:', error);
                showNotification('Error deleting production record', 'error');
            }
        }
    }

    // Get production for animal
    function getByAnimal(animalId) {
        return allProduction.filter(p => p.animalId === animalId);
    }

    // Get production for date range
    function getByDateRange(startDate, endDate) {
        return allProduction.filter(p => {
            const prodDate = new Date(p.date);
            return prodDate >= new Date(startDate) && prodDate <= new Date(endDate);
        });
    }

    // Get total production for date
    function getTotalByDate(date) {
        const records = allProduction.filter(p => p.date === date);
        return records.reduce((sum, r) => sum + r.total, 0);
    }

    // Get all production
    function getAll() {
        return allProduction;
    }

    // Get daily milk production (today)
    function getTodayTotal() {
        const today = getDateString();
        return getTotalByDate(today);
    }

    // Public API
    return {
        init,
        showAddProductionForm,
        hideAddProductionForm,
        deleteProduction,
        getByAnimal,
        getByDateRange,
        getTotalByDate,
        getTodayTotal,
        getAll,
        loadProduction,
        renderProduction,
        updateProductionStats
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Production.init();
});
