// ==================== HEALTH MODULE ====================
// Tracks animal health records and veterinary visits

const Health = (() => {
    const HEALTH_COLLECTION = 'health';
    let allHealth = [];

    function init() {
        setupEventListeners();
        loadHealth();
    }

    function setupEventListeners() {
        const addHealthBtn = document.getElementById('add-health-btn');
        const healthForm = document.getElementById('health-form');
        const cancelBtn = document.getElementById('cancel-health-btn');

        if (addHealthBtn) addHealthBtn.addEventListener('click', showForm);
        if (healthForm) healthForm.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', hideForm);
    }

    function showForm() {
        const container = document.getElementById('health-form-container');
        if (container) {
            container.classList.remove('hidden');
            document.getElementById('health-form').reset();
            document.getElementById('health-date').valueAsDate = new Date();
            updateAnimalSelect('health-animal');
        }
    }

    function hideForm() {
        const container = document.getElementById('health-form-container');
        if (container) container.classList.add('hidden');
    }

    function updateAnimalSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        const animals = Animals.getActive();
        select.innerHTML = '<option value="">Select Animal</option>' +
            animals.map(a => `<option value="${a.id}">${getAnimalEmoji(a.type)} ${a.name}</option>`).join('');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            animalId: document.getElementById('health-animal').value,
            date: document.getElementById('health-date').value,
            status: document.getElementById('health-status').value,
            temperature: parseFloat(document.getElementById('health-temperature').value) || null,
            condition: document.getElementById('health-condition').value,
            treatment: document.getElementById('health-treatment').value,
            veterinarian: document.getElementById('health-vet').value,
            notes: document.getElementById('health-notes').value,
            createdAt: new Date().toISOString()
        };

        if (!data.animalId || !data.date || !data.status || !data.condition || !data.treatment) {
            showNotification('Please fill in required fields', 'error');
            return;
        }

        try {
            showLoader('Saving health record...');
            const db = getDb();
            if (!db) {
                data.id = generateId();
                allHealth.push(data);
                Storage.set(HEALTH_COLLECTION, allHealth);
            } else {
                const docRef = await db.collection(HEALTH_COLLECTION).add(data);
                data.id = docRef.id;
                allHealth.push(data);
            }
            hideLoader();
            showNotification('Health record saved!', 'success');
            hideForm();
            renderHealth();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error:', error);
            showNotification('Error saving record', 'error');
        }
    }

    async function loadHealth() {
        try {
            const db = getDb();
            if (!db) {
                allHealth = Storage.get(HEALTH_COLLECTION, []);
            } else {
                const snapshot = await db.collection(HEALTH_COLLECTION).orderBy('createdAt', 'desc').get();
                allHealth = [];
                snapshot.forEach(doc => {
                    allHealth.push({ id: doc.id, ...doc.data() });
                });
            }
            renderHealth();
        } catch (error) {
            console.error('Error loading:', error);
            allHealth = Storage.get(HEALTH_COLLECTION, []);
            renderHealth();
        }
    }

    function renderHealth() {
        const list = document.getElementById('health-list');
        if (!list) return;

        if (allHealth.length === 0) {
            list.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No health records yet.</p>';
            return;
        }

        list.innerHTML = allHealth.map(record => {
            const animal = Animals.getById(record.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown';
            const statusColor = record.status === 'healthy' ? '#27ae60' : record.status === 'sick' ? '#e74c3c' : '#f39c12';

            return `
                <div class="vaccine-card">
                    <div class="vaccine-card-header">
                        <div>
                            <div class="animal-card-title">🏥 ${record.status.toUpperCase()}</div>
                            <div class="list-item-details">${animalName}</div>
                        </div>
                        <span class="vaccine-status ${record.status === 'healthy' ? 'active' : 'due'}" style="background: rgba(${statusColor.replace('#', '')}, 0.2);">
                            ${record.status}
                        </span>
                    </div>
                    <div class="animal-card-details">
                        <div class="detail-item"><span class="detail-label">Date:</span> ${formatDate(record.date)}</div>
                        ${record.temperature ? `<div class="detail-item"><span class="detail-label">Temp:</span> ${record.temperature}°C</div>` : ''}
                        <div class="detail-item"><span class="detail-label">Sickness:</span> ${record.condition}</div>
                        <div class="detail-item"><span class="detail-label">Treatment:</span> ${record.treatment}</div>
                        ${record.veterinarian ? `<div class="detail-item"><span class="detail-label">Vet:</span> ${record.veterinarian}</div>` : ''}
                        ${record.notes ? `<div class="detail-item"><span class="detail-label">Notes:</span> ${record.notes}</div>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-danger" onclick="Health.deleteRecord('${record.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function deleteRecord(recordId) {
        if (confirm('Delete this health record?')) {
            try {
                const db = getDb();
                if (!db) {
                    allHealth = allHealth.filter(r => r.id !== recordId);
                    Storage.set(HEALTH_COLLECTION, allHealth);
                } else {
                    await db.collection(HEALTH_COLLECTION).doc(recordId).delete();
                    allHealth = allHealth.filter(r => r.id !== recordId);
                }
                showNotification('Record deleted', 'success');
                renderHealth();
                updateDashboard();
            } catch (error) {
                showNotification('Error deleting record', 'error');
            }
        }
    }

    function getByAnimal(animalId) {
        return allHealth.filter(h => h.animalId === animalId);
    }

    function getSickAnimals() {
        return allHealth.filter(h => h.status === 'sick');
    }

    function getAll() {
        return allHealth;
    }

    return {
        init, showForm, hideForm, deleteRecord, getByAnimal, getSickAnimals, getAll, loadHealth, renderHealth
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Health.init();
});
