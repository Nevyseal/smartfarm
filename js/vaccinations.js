// ==================== VACCINATIONS MODULE ====================
// Handles vaccination records for all animals

const Vaccinations = (() => {
    const VACCINATIONS_COLLECTION = 'vaccinations';
    let allVaccinations = [];

    // Initialize module
    function init() {
        setupEventListeners();
        loadVaccinations();
    }

    // Setup event listeners
    function setupEventListeners() {
        const addVaccineBtn = document.getElementById('add-vaccine-btn');
        const vaccineForm = document.getElementById('vaccine-form');
        const cancelVaccineBtn = document.getElementById('cancel-vaccine-btn');

        if (addVaccineBtn) {
            addVaccineBtn.addEventListener('click', showAddVaccineForm);
        }

        if (vaccineForm) {
            vaccineForm.addEventListener('submit', handleAddVaccine);
        }

        if (cancelVaccineBtn) {
            cancelVaccineBtn.addEventListener('click', hideAddVaccineForm);
        }
    }

    // Show add vaccine form
    function showAddVaccineForm() {
        const formContainer = document.getElementById('vaccine-form-container');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            document.getElementById('vaccine-form').reset();
            document.getElementById('vaccine-date').valueAsDate = new Date();
            updateAnimalSelect('vaccine-animal');
        }
    }

    // Hide add vaccine form
    function hideAddVaccineForm() {
        const formContainer = document.getElementById('vaccine-form-container');
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

    // Handle add vaccine form submission
    async function handleAddVaccine(e) {
        e.preventDefault();

        const vaccineData = {
            animalId: document.getElementById('vaccine-animal').value,
            vaccineType: document.getElementById('vaccine-type').value,
            dateVaccinated: document.getElementById('vaccine-date').value,
            nextDueDate: document.getElementById('vaccine-next-due').value,
            veterinarian: document.getElementById('vaccine-vet').value,
            notes: document.getElementById('vaccine-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!vaccineData.animalId || !vaccineData.vaccineType || !vaccineData.dateVaccinated) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Recording vaccination...');

            const db = getDb();
            if (!db) {
                vaccineData.id = generateId();
                allVaccinations.push(vaccineData);
                Storage.set(VACCINATIONS_COLLECTION, allVaccinations);
            } else {
                const docRef = await db.collection(VACCINATIONS_COLLECTION).add(vaccineData);
                vaccineData.id = docRef.id;
                allVaccinations.push(vaccineData);
            }

            hideLoader();
            showNotification('Vaccination recorded successfully!', 'success');
            hideAddVaccineForm();
            renderVaccinations();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error adding vaccination:', error);
            showNotification('Error recording vaccination', 'error');
        }
    }

    // Load vaccinations from database
    async function loadVaccinations() {
        try {
            const db = getDb();

            if (!db) {
                allVaccinations = Storage.get(VACCINATIONS_COLLECTION, []);
            } else {
                const querySnapshot = await db.collection(VACCINATIONS_COLLECTION)
                    .orderBy('createdAt', 'desc')
                    .get();

                allVaccinations = [];
                querySnapshot.forEach(doc => {
                    allVaccinations.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            renderVaccinations();
        } catch (error) {
            console.error('Error loading vaccinations:', error);
            allVaccinations = Storage.get(VACCINATIONS_COLLECTION, []);
            renderVaccinations();
        }
    }

    // Render vaccinations list
    function renderVaccinations() {
        const vaccinesList = document.getElementById('vaccines-list');

        if (!vaccinesList) return;

        if (allVaccinations.length === 0) {
            vaccinesList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No vaccinations recorded yet.</p>';
            return;
        }

        vaccinesList.innerHTML = allVaccinations.map(vaccine => {
            const animal = Animals.getById(vaccine.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown Animal';
            const status = getVaccineStatus(vaccine.dateVaccinated, vaccine.nextDueDate);

            return `
                <div class="vaccine-card">
                    <div class="vaccine-card-header">
                        <div>
                            <div class="animal-card-title">💉 ${vaccine.vaccineType}</div>
                            <div class="list-item-details">${animalName}</div>
                        </div>
                        <span class="vaccine-status ${status.class}">${status.text}</span>
                    </div>
                    <div class="animal-card-details">
                        <div class="detail-item">
                            <span class="detail-label">Date Vaccinated:</span> ${formatDate(vaccine.dateVaccinated)}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Next Due:</span> ${vaccine.nextDueDate ? formatDate(vaccine.nextDueDate) : 'Not set'}
                        </div>
                        ${vaccine.veterinarian ? `
                            <div class="detail-item">
                                <span class="detail-label">Vet:</span> ${vaccine.veterinarian}
                            </div>
                        ` : ''}
                        ${vaccine.notes ? `
                            <div class="detail-item">
                                <span class="detail-label">Notes:</span> ${vaccine.notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-danger" onclick="Vaccinations.deleteVaccine('${vaccine.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get vaccine status
    function getVaccineStatus(dateVaccinated, nextDueDate) {
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

    // Delete vaccine record
    async function deleteVaccine(vaccineId) {
        if (confirm('Are you sure you want to delete this vaccination record?')) {
            try {
                const db = getDb();

                if (!db) {
                    allVaccinations = allVaccinations.filter(v => v.id !== vaccineId);
                    Storage.set(VACCINATIONS_COLLECTION, allVaccinations);
                } else {
                    await db.collection(VACCINATIONS_COLLECTION).doc(vaccineId).delete();
                    allVaccinations = allVaccinations.filter(v => v.id !== vaccineId);
                }

                showNotification('Vaccination record deleted', 'success');
                renderVaccinations();
                updateDashboard();
            } catch (error) {
                console.error('Error deleting vaccination:', error);
                showNotification('Error deleting vaccination record', 'error');
            }
        }
    }

    // Get vaccinations for animal
    function getByAnimal(animalId) {
        return allVaccinations.filter(v => v.animalId === animalId);
    }

    // Get overdue vaccinations
    function getOverdue() {
        return allVaccinations.filter(v => v.nextDueDate && isOverdue(v.nextDueDate));
    }

    // Get due soon vaccinations
    function getDueSoon() {
        return allVaccinations.filter(v => v.nextDueDate && isDueSoon(v.nextDueDate) && !isOverdue(v.nextDueDate));
    }

    // Get all vaccinations
    function getAll() {
        return allVaccinations;
    }

    // Public API
    return {
        init,
        showAddVaccineForm,
        hideAddVaccineForm,
        deleteVaccine,
        getByAnimal,
        getOverdue,
        getDueSoon,
        getAll,
        loadVaccinations,
        renderVaccinations
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Vaccinations.init();
});
