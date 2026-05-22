// ==================== ANIMALS MODULE ====================
// Handles all animal-related operations (add, edit, delete, retrieve)

const Animals = (() => {
    // Private variables
    const ANIMALS_COLLECTION = 'animals';
    let allAnimals = [];

    // Initialize module
    function init() {
        setupEventListeners();
        loadAnimals();
    }

    // Setup event listeners
    function setupEventListeners() {
        const addAnimalBtn = document.getElementById('add-animal-btn');
        const animalForm = document.getElementById('animal-form');
        const cancelAnimalBtn = document.getElementById('cancel-animal-btn');

        if (addAnimalBtn) {
            addAnimalBtn.addEventListener('click', showAddAnimalForm);
        }

        if (animalForm) {
            animalForm.addEventListener('submit', handleAddAnimal);
        }

        if (cancelAnimalBtn) {
            cancelAnimalBtn.addEventListener('click', hideAddAnimalForm);
        }
    }

    // Show add animal form
    function showAddAnimalForm() {
        const formContainer = document.getElementById('animal-form-container');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            document.getElementById('animal-form').reset();
            document.getElementById('animal-id').value = '';
            document.getElementById('animal-form-title').textContent = 'Add New Animal';
            document.getElementById('animal-date-added').valueAsDate = new Date();
        }
    }

    // Hide add animal form
    function hideAddAnimalForm() {
        const formContainer = document.getElementById('animal-form-container');
        if (formContainer) {
            formContainer.classList.add('hidden');
        }
    }

    // Handle add/edit animal form submission
    async function handleAddAnimal(e) {
        e.preventDefault();

        const animalId = document.getElementById('animal-id').value;
        const animalData = {
            type: document.getElementById('animal-type').value,
            name: document.getElementById('animal-name').value,
            age: parseInt(document.getElementById('animal-age').value) || 0,
            weight: parseFloat(document.getElementById('animal-weight').value) || 0,
            dateAdded: document.getElementById('animal-date-added').value,
            status: document.getElementById('animal-status').value,
            updatedAt: new Date().toISOString()
        };

        if (!animalId) {
            animalData.createdAt = new Date().toISOString();
        }

        if (!animalData.type || !animalData.name) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader(animalId ? 'Updating animal...' : 'Adding animal...');
            
            const db = getDb();
            if (!db) {
                // Use local storage if Firebase is not available
                if (animalId) {
                    const index = allAnimals.findIndex(a => a.id === animalId);
                    if (index !== -1) {
                        allAnimals[index] = { ...allAnimals[index], ...animalData };
                    }
                } else {
                    animalData.id = generateId();
                    allAnimals.push(animalData);
                }
                Storage.set(ANIMALS_COLLECTION, allAnimals);
            } else {
                // Save to Firebase
                if (animalId) {
                    await db.collection(ANIMALS_COLLECTION).doc(animalId).update(animalData);
                    const index = allAnimals.findIndex(a => a.id === animalId);
                    if (index !== -1) {
                        allAnimals[index] = { ...allAnimals[index], ...animalData, id: animalId };
                    }
                } else {
                    const docRef = await db.collection(ANIMALS_COLLECTION).add(animalData);
                    animalData.id = docRef.id;
                    allAnimals.unshift(animalData);
                }
            }

            hideLoader();
            showNotification(animalId ? 'Animal updated successfully!' : 'Animal added successfully!', 'success');
            hideAddAnimalForm();
            renderAnimals();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error saving animal:', error);
            showNotification('Error saving animal. Please try again.', 'error');
        }
    }

    // Load animals from database
    async function loadAnimals() {
        try {
            const db = getDb();
            
            if (!db) {
                // Use local storage if Firebase is not available
                allAnimals = Storage.get(ANIMALS_COLLECTION, []);
            } else {
                // Load from Firebase
                const querySnapshot = await db.collection(ANIMALS_COLLECTION)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                allAnimals = [];
                querySnapshot.forEach(doc => {
                    allAnimals.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            renderAnimals();
            updateDashboard();
        } catch (error) {
            console.error('Error loading animals:', error);
            // Fallback to local storage
            allAnimals = Storage.get(ANIMALS_COLLECTION, []);
            renderAnimals();
        }
    }

    // Render animals list
    function renderAnimals() {
        const animalsList = document.getElementById('animals-list');
        
        if (!animalsList) return;

        if (allAnimals.length === 0) {
            animalsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No animals added yet. Click "Add Animal" to get started.</p>';
            return;
        }

        animalsList.innerHTML = allAnimals.map(animal => `
            <div class="animal-card">
                <div class="animal-card-header">
                    <div>
                        <div class="animal-card-title">${getAnimalEmoji(animal.type)} ${animal.name}</div>
                        <span class="animal-type-badge">${formatAnimalType(animal.type)}</span>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-primary" onclick="Animals.editAnimal('${animal.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="Animals.deleteAnimal('${animal.id}')">Delete</button>
                    </div>
                </div>
                <div class="animal-card-details">
                    <div class="detail-item">
                        <span class="detail-label">Age:</span> ${animal.age} months
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Weight:</span> ${animal.weight} kg
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Added:</span> ${formatDate(animal.dateAdded)}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span> 
                        <span style="color: ${animal.status === 'active' ? '#2ecc71' : '#e74c3c'}">
                            ${animal.status === 'active' ? '✓ Active' : '✗ Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Edit animal
    async function editAnimal(animalId) {
        const animal = allAnimals.find(a => a.id === animalId);
        if (animal) {
            document.getElementById('animal-id').value = animal.id;
            document.getElementById('animal-form-title').textContent = `Edit Animal: ${animal.name}`;
            document.getElementById('animal-type').value = animal.type;
            document.getElementById('animal-name').value = animal.name;
            document.getElementById('animal-age').value = animal.age;
            document.getElementById('animal-weight').value = animal.weight;
            document.getElementById('animal-date-added').value = animal.dateAdded;
            document.getElementById('animal-status').value = animal.status;
            
            // Show form
            const formContainer = document.getElementById('animal-form-container');
            if (formContainer) {
                formContainer.classList.remove('hidden');
                formContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // Delete animal
    async function deleteAnimal(animalId) {
        if (confirm('Are you sure you want to delete this animal?')) {
            try {
                const db = getDb();
                
                if (!db) {
                    // Use local storage
                    allAnimals = allAnimals.filter(a => a.id !== animalId);
                    Storage.set(ANIMALS_COLLECTION, allAnimals);
                } else {
                    // Delete from Firebase
                    await db.collection(ANIMALS_COLLECTION).doc(animalId).delete();
                    allAnimals = allAnimals.filter(a => a.id !== animalId);
                }

                showNotification('Animal deleted successfully', 'success');
                renderAnimals();
                updateDashboard();
            } catch (error) {
                console.error('Error deleting animal:', error);
                showNotification('Error deleting animal', 'error');
            }
        }
    }

    // Get all animals
    function getAll() {
        return allAnimals;
    }

    // Get animals by type
    function getByType(type) {
        return allAnimals.filter(a => a.type === type && a.status === 'active');
    }

    // Get active animals
    function getActive() {
        return allAnimals.filter(a => a.status === 'active');
    }

    // Get animal by ID
    function getById(id) {
        return allAnimals.find(a => a.id === id);
    }

    // Update animal
    async function update(animalId, updates) {
        try {
            const db = getDb();
            
            if (!db) {
                const index = allAnimals.findIndex(a => a.id === animalId);
                if (index !== -1) {
                    allAnimals[index] = { ...allAnimals[index], ...updates };
                    Storage.set(ANIMALS_COLLECTION, allAnimals);
                }
            } else {
                await db.collection(ANIMALS_COLLECTION).doc(animalId).update(updates);
                const index = allAnimals.findIndex(a => a.id === animalId);
                if (index !== -1) {
                    allAnimals[index] = { ...allAnimals[index], ...updates };
                }
            }

            return true;
        } catch (error) {
            console.error('Error updating animal:', error);
            return false;
        }
    }

    // Public API
    return {
        init,
        showAddAnimalForm,
        hideAddAnimalForm,
        editAnimal,
        deleteAnimal,
        getAll,
        getByType,
        getActive,
        getById,
        update,
        loadAnimals,
        renderAnimals
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Animals.init();
});
