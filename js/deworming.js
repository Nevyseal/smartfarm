// ==================== DEWORMING MODULE ====================
// Handles deworming records and schedules

const Deworming = (() => {
    const DEWORMING_COLLECTION = 'deworming';
    let allDeworming = [];

    // Initialize module
    function init() {
        setupEventListeners();
        loadDeworming();
    }

    // Setup event listeners
    function setupEventListeners() {
        const addDewormingBtn = document.getElementById('add-deworming-btn');
        const dewormingForm = document.getElementById('deworming-form');
        const cancelDewormingBtn = document.getElementById('cancel-deworming-btn');

        if (addDewormingBtn) {
            addDewormingBtn.addEventListener('click', showAddDewormingForm);
        }

        if (dewormingForm) {
            dewormingForm.addEventListener('submit', handleAddDeworming);
        }

        if (cancelDewormingBtn) {
            cancelDewormingBtn.addEventListener('click', hideAddDewormingForm);
        }
    }

    // Show add deworming form
    function showAddDewormingForm() {
        const formContainer = document.getElementById('deworming-form-container');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            document.getElementById('deworming-form').reset();
            document.getElementById('deworming-date').valueAsDate = new Date();
            
            // Set default next due date (90 days from today)
            const nextDue = new Date();
            nextDue.setDate(nextDue.getDate() + 90);
            document.getElementById('deworming-next-due').valueAsDate = nextDue;
            
            updateAnimalSelect('deworming-animal');
        }
    }

    // Hide add deworming form
    function hideAddDewormingForm() {
        const formContainer = document.getElementById('deworming-form-container');
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

    // Handle add deworming form submission
    async function handleAddDeworming(e) {
        e.preventDefault();

        const dewormingData = {
            animalId: document.getElementById('deworming-animal').value,
            dateDewomed: document.getElementById('deworming-date').value,
            brand: document.getElementById('deworming-brand').value,
            amount: parseFloat(document.getElementById('deworming-amount').value),
            nextDueDate: document.getElementById('deworming-next-due').value,
            veterinarian: document.getElementById('deworming-vet').value,
            notes: document.getElementById('deworming-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!dewormingData.animalId || !dewormingData.dateDewomed || !dewormingData.brand || !dewormingData.amount) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Recording deworming...');

            const db = getDb();
            if (!db) {
                dewormingData.id = generateId();
                allDeworming.push(dewormingData);
                Storage.set(DEWORMING_COLLECTION, allDeworming);
            } else {
                const docRef = await db.collection(DEWORMING_COLLECTION).add(dewormingData);
                dewormingData.id = docRef.id;
                allDeworming.push(dewormingData);
            }

            hideLoader();
            showNotification('Deworming record saved successfully!', 'success');
            hideAddDewormingForm();
            renderDeworming();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error adding deworming:', error);
            showNotification('Error recording deworming', 'error');
        }
    }

    // Load deworming from database
    async function loadDeworming() {
        try {
            const db = getDb();

            if (!db) {
                allDeworming = Storage.get(DEWORMING_COLLECTION, []);
            } else {
                const querySnapshot = await db.collection(DEWORMING_COLLECTION)
                    .orderBy('createdAt', 'desc')
                    .get();

                allDeworming = [];
                querySnapshot.forEach(doc => {
                    allDeworming.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            renderDeworming();
        } catch (error) {
            console.error('Error loading deworming:', error);
            allDeworming = Storage.get(DEWORMING_COLLECTION, []);
            renderDeworming();
        }
    }

    // Render deworming list
    function renderDeworming() {
        const dewormingList = document.getElementById('deworming-list');

        if (!dewormingList) return;

        if (allDeworming.length === 0) {
            dewormingList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No deworming records yet.</p>';
            return;
        }

        dewormingList.innerHTML = allDeworming.map(record => {
            const animal = Animals.getById(record.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown Animal';
            const status = getDewormingStatus(record.dateDewomed, record.nextDueDate);

            return `
                <div class="vaccine-card">
                    <div class="vaccine-card-header">
                        <div>
                            <div class="animal-card-title">💊 ${record.brand}</div>
                            <div class="list-item-details">${animalName}</div>
                        </div>
                        <span class="vaccine-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="animal-card-details">
                        <div class="detail-item">
                            <span class="detail-label">Date Dewormed:</span> ${formatDate(record.dateDewomed)}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Amount:</span> ${record.amount} kg
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Next Due:</span> ${record.nextDueDate ? formatDate(record.nextDueDate) : 'Not scheduled'}
                        </div>
                        ${record.veterinarian ? `
                            <div class="detail-item">
                                <span class="detail-label">Vet:</span> ${record.veterinarian}
                            </div>
                        ` : ''}
                        ${record.notes ? `
                            <div class="detail-item">
                                <span class="detail-label">Notes:</span> ${record.notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-danger" onclick="Deworming.deleteDeworming('${record.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get deworming status
    function getDewormingStatus(dateDewomed, nextDueDate) {
        if (!nextDueDate) {
            return { class: 'active', text: 'Completed' };
        }

        if (isOverdue(nextDueDate)) {
            return { class: 'overdue', text: '⚠️ Overdue' };
        }

        if (isDueSoon(nextDueDate)) {
            return { class: 'due', text: '📅 Due Soon' };
        }

        return { class: 'active', text: '✓ Current' };
    }

    // Delete deworming record
    async function deleteDeworming(dewormingId) {
        if (confirm('Are you sure you want to delete this deworming record?')) {
            try {
                const db = getDb();

                if (!db) {
                    allDeworming = allDeworming.filter(d => d.id !== dewormingId);
                    Storage.set(DEWORMING_COLLECTION, allDeworming);
                } else {
                    await db.collection(DEWORMING_COLLECTION).doc(dewormingId).delete();
                    allDeworming = allDeworming.filter(d => d.id !== dewormingId);
                }

                showNotification('Deworming record deleted', 'success');
                renderDeworming();
                updateDashboard();
            } catch (error) {
                console.error('Error deleting deworming:', error);
                showNotification('Error deleting deworming record', 'error');
            }
        }
    }

    // Get deworming for animal
    function getByAnimal(animalId) {
        return allDeworming.filter(d => d.animalId === animalId);
    }

    // Get overdue deworming
    function getOverdue() {
        return allDeworming.filter(d => d.nextDueDate && isOverdue(d.nextDueDate));
    }

    // Get due soon deworming
    function getDueSoon() {
        return allDeworming.filter(d => d.nextDueDate && isDueSoon(d.nextDueDate) && !isOverdue(d.nextDueDate));
    }

    // Get all deworming records
    function getAll() {
        return allDeworming;
    }

    // Public API
    return {
        init,
        showAddDewormingForm,
        hideAddDewormingForm,
        deleteDeworming,
        getByAnimal,
        getOverdue,
        getDueSoon,
        getAll,
        loadDeworming,
        renderDeworming
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Deworming.init();
});
