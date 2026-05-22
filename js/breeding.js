// ==================== BREEDING MODULE ====================
// Tracks breeding cycles and pregnancy status

const Breeding = (() => {
    const BREEDING_COLLECTION = 'breeding';
    let allBreeding = [];

    function init() {
        setupEventListeners();
        loadBreeding();
    }

    function setupEventListeners() {
        const addBtn = document.getElementById('add-breeding-btn');
        const form = document.getElementById('breeding-form');
        const cancelBtn = document.getElementById('cancel-breeding-btn');

        if (addBtn) addBtn.addEventListener('click', showForm);
        if (form) form.addEventListener('submit', handleSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', hideForm);
    }

    function showForm() {
        const container = document.getElementById('breeding-form-container');
        if (container) {
            container.classList.remove('hidden');
            document.getElementById('breeding-form').reset();
            document.getElementById('breeding-id').value = '';
            document.getElementById('breeding-form-title').textContent = 'Breeding Record 👶';
            document.getElementById('breeding-date').valueAsDate = new Date();
            
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 280);
            document.getElementById('breeding-due-date').valueAsDate = dueDate;
            
            updateAnimalSelect('breeding-animal');
        }
    }

    function hideForm() {
        const container = document.getElementById('breeding-form-container');
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

        const recordId = document.getElementById('breeding-id').value;
        const data = {
            animalId: document.getElementById('breeding-animal').value,
            sire: document.getElementById('breeding-sire').value,
            breedingDate: document.getElementById('breeding-date').value,
            expectedDueDate: document.getElementById('breeding-due-date').value,
            status: document.getElementById('breeding-status').value,
            offspring: parseInt(document.getElementById('breeding-offspring').value) || 0,
            conceptionRate: parseInt(document.getElementById('breeding-conception-rate').value) || null,
            performance: document.getElementById('breeding-performance').value,
            notes: document.getElementById('breeding-notes').value,
            updatedAt: new Date().toISOString()
        };

        if (!recordId) {
            data.createdAt = new Date().toISOString();
        }

        if (!data.animalId || !data.breedingDate || !data.status) {
            showNotification('Please fill in required fields', 'error');
            return;
        }

        try {
            showLoader(recordId ? 'Updating breeding record...' : 'Saving breeding record...');
            const db = getDb();
            if (!db) {
                if (recordId) {
                    const index = allBreeding.findIndex(r => r.id === recordId);
                    if (index !== -1) allBreeding[index] = { ...allBreeding[index], ...data };
                } else {
                    data.id = generateId();
                    allBreeding.unshift(data);
                }
                Storage.set(BREEDING_COLLECTION, allBreeding);
            } else {
                if (recordId) {
                    await db.collection(BREEDING_COLLECTION).doc(recordId).update(data);
                    const index = allBreeding.findIndex(r => r.id === recordId);
                    if (index !== -1) allBreeding[index] = { ...allBreeding[index], ...data, id: recordId };
                } else {
                    const docRef = await db.collection(BREEDING_COLLECTION).add(data);
                    data.id = docRef.id;
                    allBreeding.unshift(data);
                }
            }
            hideLoader();
            showNotification(recordId ? 'Record updated!' : 'Breeding record saved!', 'success');
            hideForm();
            renderBreeding();
            updateDashboard();
        } catch (error) {
            hideLoader();
            showNotification('Error saving record', 'error');
        }
    }

    async function loadBreeding() {
        try {
            const db = getDb();
            if (!db) {
                allBreeding = Storage.get(BREEDING_COLLECTION, []);
            } else {
                const snapshot = await db.collection(BREEDING_COLLECTION).orderBy('createdAt', 'desc').get();
                allBreeding = [];
                snapshot.forEach(doc => {
                    allBreeding.push({ id: doc.id, ...doc.data() });
                });
            }
            renderBreeding();
        } catch (error) {
            allBreeding = Storage.get(BREEDING_COLLECTION, []);
            renderBreeding();
        }
    }

    function renderBreeding() {
        const list = document.getElementById('breeding-list');
        if (!list) return;

        if (allBreeding.length === 0) {
            list.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No breeding records yet.</p>';
            return;
        }

        const statusMap = {
            'in_heat': { text: 'In Heat', emoji: '🔥', class: 'due' },
            'inseminated': { text: 'Inseminated', emoji: '💉', class: 'due' },
            'pregnant': { text: 'Pregnant', emoji: '🤰', class: 'active' },
            'delivered': { text: 'Delivered', emoji: '👶', class: 'active' },
            'failed': { text: 'Failed/Repeat', emoji: '❌', class: 'overdue' }
        };

        list.innerHTML = allBreeding.map(record => {
            const animal = Animals.getById(record.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown';
            const statusInfo = statusMap[record.status] || { text: record.status, emoji: '📅', class: 'due' };

            return `
                <div class="vaccine-card">
                    <div class="vaccine-card-header">
                        <div>
                            <div class="animal-card-title">${statusInfo.emoji} ${statusInfo.text.toUpperCase()}</div>
                            <div class="list-item-details">${animalName}</div>
                        </div>
                        <span class="vaccine-status ${statusInfo.class}">
                            ${statusInfo.text}
                        </span>
                    </div>
                    <div class="animal-card-details">
                        <div class="detail-item"><span class="detail-label">Event Date:</span> ${formatDate(record.breedingDate)}</div>
                        ${record.expectedDueDate ? `<div class="detail-item"><span class="detail-label">Expected Due:</span> ${formatDate(record.expectedDueDate)}</div>` : ''}
                        ${record.sire ? `<div class="detail-item"><span class="detail-label">Sire ID:</span> ${record.sire}</div>` : ''}
                        ${record.offspring > 0 ? `<div class="detail-item"><span class="detail-label">Offspring:</span> ${record.offspring}</div>` : ''}
                        ${record.conceptionRate ? `<div class="detail-item"><span class="detail-label">Conception Rate:</span> ${record.conceptionRate}%</div>` : ''}
                        ${record.performance ? `<div class="detail-item"><span class="detail-label">Performance:</span> <span class="performance-badge performance-${record.performance}">${record.performance.toUpperCase()}</span></div>` : ''}
                        ${record.notes ? `<div class="detail-item"><span class="detail-label">Notes:</span> ${record.notes}</div>` : ''}
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-primary" onclick="Breeding.editRecord('${record.id}')">Manage</button>
                        <button class="btn btn-small btn-danger" onclick="Breeding.deleteRecord('${record.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function editRecord(recordId) {
        const record = allBreeding.find(r => r.id === recordId);
        if (record) {
            updateAnimalSelect('breeding-animal');
            
            document.getElementById('breeding-id').value = record.id;
            document.getElementById('breeding-form-title').textContent = 'Manage Breeding Status ⚙️';
            document.getElementById('breeding-animal').value = record.animalId;
            document.getElementById('breeding-sire').value = record.sire || '';
            document.getElementById('breeding-date').value = record.breedingDate;
            document.getElementById('breeding-due-date').value = record.expectedDueDate || '';
            document.getElementById('breeding-status').value = record.status;
            document.getElementById('breeding-offspring').value = record.offspring || 0;
            document.getElementById('breeding-conception-rate').value = record.conceptionRate || '';
            document.getElementById('breeding-performance').value = record.performance || '';
            document.getElementById('breeding-notes').value = record.notes || '';
            
            const container = document.getElementById('breeding-form-container');
            if (container) {
                container.classList.remove('hidden');
                container.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    async function deleteRecord(recordId) {
        if (confirm('Delete this breeding record?')) {
            try {
                const db = getDb();
                if (!db) {
                    allBreeding = allBreeding.filter(r => r.id !== recordId);
                    Storage.set(BREEDING_COLLECTION, allBreeding);
                } else {
                    await db.collection(BREEDING_COLLECTION).doc(recordId).delete();
                    allBreeding = allBreeding.filter(r => r.id !== recordId);
                }
                showNotification('Record deleted', 'success');
                renderBreeding();
            } catch (error) {
                showNotification('Error deleting record', 'error');
            }
        }
    }

    function getPregnantAnimals() {
        return allBreeding.filter(b => b.status === 'pregnant');
    }

    function getByAnimal(animalId) {
        return allBreeding.filter(b => b.animalId === animalId);
    }

    function getAll() {
        return allBreeding;
    }

    return {
        init, showForm, hideForm, deleteRecord, editRecord, getPregnantAnimals, getByAnimal, getAll, loadBreeding, renderBreeding
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    Breeding.init();
});
