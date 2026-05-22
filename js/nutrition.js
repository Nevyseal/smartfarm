// ==================== NUTRITION MODULE ====================
// Handles nutrition and feeding records

const Nutrition = (() => {
    const NUTRITION_COLLECTION = 'nutrition';
    let allNutrition = [];

    // Initialize module
    function init() {
        setupEventListeners();
        loadNutrition();
    }

    // Setup event listeners
    function setupEventListeners() {
        const addNutritionBtn = document.getElementById('add-nutrition-btn');
        const nutritionForm = document.getElementById('nutrition-form');
        const cancelNutritionBtn = document.getElementById('cancel-nutrition-btn');

        if (addNutritionBtn) {
            addNutritionBtn.addEventListener('click', showAddNutritionForm);
        }

        if (nutritionForm) {
            nutritionForm.addEventListener('submit', handleAddNutrition);
        }

        if (cancelNutritionBtn) {
            cancelNutritionBtn.addEventListener('click', hideAddNutritionForm);
        }
    }

    // Show add nutrition form
    function showAddNutritionForm() {
        const formContainer = document.getElementById('nutrition-form-container');
        if (formContainer) {
            formContainer.classList.remove('hidden');
            document.getElementById('nutrition-form').reset();
            document.getElementById('nutrition-date').valueAsDate = new Date();
            updateAnimalSelect('nutrition-animal');
        }
    }

    // Hide add nutrition form
    function hideAddNutritionForm() {
        const formContainer = document.getElementById('nutrition-form-container');
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

    // Handle add nutrition form submission
    async function handleAddNutrition(e) {
        e.preventDefault();

        const nutritionData = {
            animalId: document.getElementById('nutrition-animal').value,
            date: document.getElementById('nutrition-date').value,
            forage: {
                hayBales: parseFloat(document.getElementById('nutrition-hay').value) || 0,
                silageCorn: parseFloat(document.getElementById('nutrition-silage').value) || 0,
                babyCorn: parseFloat(document.getElementById('nutrition-baby-corn').value) || 0,
                nappierGrass: parseFloat(document.getElementById('nutrition-nappier').value) || 0
            },
            concentrates: {
                dairyMeal: parseFloat(document.getElementById('nutrition-dairy-meal').value) || 0,
                maizeMeal: parseFloat(document.getElementById('nutrition-maize-meal').value) || 0,
                maizeGerm: parseFloat(document.getElementById('nutrition-maize-germ').value) || 0,
                wheatBran: parseFloat(document.getElementById('nutrition-wheat-bran').value) || 0,
                wheatPollard: parseFloat(document.getElementById('nutrition-wheat-pollard').value) || 0,
                molasses: parseFloat(document.getElementById('nutrition-molasses').value) || 0,
                machicha: parseFloat(document.getElementById('nutrition-machicha').value) || 0
            },
            salts: {
                salt: parseFloat(document.getElementById('nutrition-salt').value) || 0
            },
            createdAt: new Date().toISOString()
        };

        if (!nutritionData.animalId || !nutritionData.date) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoader('Recording nutrition data...');

            const db = getDb();
            if (!db) {
                nutritionData.id = generateId();
                allNutrition.push(nutritionData);
                Storage.set(NUTRITION_COLLECTION, allNutrition);
            } else {
                const docRef = await db.collection(NUTRITION_COLLECTION).add(nutritionData);
                nutritionData.id = docRef.id;
                allNutrition.push(nutritionData);
            }

            hideLoader();
            showNotification('Nutrition record saved successfully!', 'success');
            hideAddNutritionForm();
            renderNutrition();
            updateDashboard();
        } catch (error) {
            hideLoader();
            console.error('Error adding nutrition:', error);
            showNotification('Error recording nutrition data', 'error');
        }
    }

    // Load nutrition from database
    async function loadNutrition() {
        try {
            const db = getDb();

            if (!db) {
                allNutrition = Storage.get(NUTRITION_COLLECTION, []);
            } else {
                const querySnapshot = await db.collection(NUTRITION_COLLECTION)
                    .orderBy('createdAt', 'desc')
                    .get();

                allNutrition = [];
                querySnapshot.forEach(doc => {
                    allNutrition.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            renderNutrition();
        } catch (error) {
            console.error('Error loading nutrition:', error);
            allNutrition = Storage.get(NUTRITION_COLLECTION, []);
            renderNutrition();
        }
    }

    // Render nutrition list
    function renderNutrition() {
        const nutritionList = document.getElementById('nutrition-list');

        if (!nutritionList) return;

        if (allNutrition.length === 0) {
            nutritionList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No nutrition records yet.</p>';
            return;
        }

        nutritionList.innerHTML = allNutrition.map(record => {
            const animal = Animals.getById(record.animalId);
            const animalName = animal ? `${getAnimalEmoji(animal.type)} ${animal.name}` : 'Unknown Animal';

            const forageTotal = record.forage.hayBales + record.forage.silageCorn + record.forage.babyCorn + record.forage.nappierGrass;
            const concentratesTotal = record.concentrates.dairyMeal + record.concentrates.maizeMeal + record.concentrates.maizeGerm + 
                                      record.concentrates.wheatBran + record.concentrates.wheatPollard + record.concentrates.molasses + record.concentrates.machicha;

            return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">🌾 ${animalName}</div>
                        <div class="list-item-details">
                            Date: ${formatDate(record.date)}
                        </div>
                        <div class="list-item-details" style="margin-top: 5px;">
                            <strong>Forage:</strong> ${forageTotal.toFixed(2)} kg | 
                            <strong>Concentrates:</strong> ${concentratesTotal.toFixed(2)} kg | 
                            <strong>Salt:</strong> ${record.salts.salt.toFixed(2)} kg
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-primary" onclick="Nutrition.viewDetails('${record.id}')">View</button>
                        <button class="btn btn-small btn-danger" onclick="Nutrition.deleteNutrition('${record.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // View nutrition details (can show in modal or expand)
    function viewDetails(nutritionId) {
        const record = allNutrition.find(n => n.id === nutritionId);
        if (record) {
            const animal = Animals.getById(record.animalId);
            const details = `
Nutrition Details for ${animal ? animal.name : 'Unknown'}
Date: ${formatDate(record.date)}

FORAGE (kg):
- Hay Bales: ${record.forage.hayBales}
- Silage Full Corn: ${record.forage.silageCorn}
- Baby Corn: ${record.forage.babyCorn}
- Nappier Grass: ${record.forage.nappierGrass}

CONCENTRATES (kg):
- Dairy Meal: ${record.concentrates.dairyMeal}
- Maize Meal: ${record.concentrates.maizeMeal}
- Maize Germ: ${record.concentrates.maizeGerm}
- Wheat Bran: ${record.concentrates.wheatBran}
- Wheat Pollard: ${record.concentrates.wheatPollard}
- Molasses: ${record.concentrates.molasses}
- Machicha/Pulp: ${record.concentrates.machicha}

SALTS (kg):
- Salt: ${record.salts.salt}
            `;
            alert(details);
        }
    }

    // Delete nutrition record
    async function deleteNutrition(nutritionId) {
        if (confirm('Are you sure you want to delete this nutrition record?')) {
            try {
                const db = getDb();

                if (!db) {
                    allNutrition = allNutrition.filter(n => n.id !== nutritionId);
                    Storage.set(NUTRITION_COLLECTION, allNutrition);
                } else {
                    await db.collection(NUTRITION_COLLECTION).doc(nutritionId).delete();
                    allNutrition = allNutrition.filter(n => n.id !== nutritionId);
                }

                showNotification('Nutrition record deleted', 'success');
                renderNutrition();
                updateDashboard();
            } catch (error) {
                console.error('Error deleting nutrition:', error);
                showNotification('Error deleting nutrition record', 'error');
            }
        }
    }

    // Get nutrition for animal
    function getByAnimal(animalId) {
        return allNutrition.filter(n => n.animalId === animalId);
    }

    // Get nutrition for date range
    function getByDateRange(startDate, endDate) {
        return allNutrition.filter(n => {
            const nutDate = new Date(n.date);
            return nutDate >= new Date(startDate) && nutDate <= new Date(endDate);
        });
    }

    // Get all nutrition records
    function getAll() {
        return allNutrition;
    }

    // Get total forage for period
    function getTotalForagePeriod(startDate, endDate) {
        const records = getByDateRange(startDate, endDate);
        return records.reduce((sum, r) => {
            return sum + r.forage.hayBales + r.forage.silageCorn + r.forage.babyCorn + r.forage.nappierGrass;
        }, 0);
    }

    // Get total concentrates for period
    function getTotalConcentratesPeriod(startDate, endDate) {
        const records = getByDateRange(startDate, endDate);
        return records.reduce((sum, r) => {
            return sum + r.concentrates.dairyMeal + r.concentrates.maizeMeal + r.concentrates.maizeGerm + 
                         r.concentrates.wheatBran + r.concentrates.wheatPollard + r.concentrates.molasses + r.concentrates.machicha;
        }, 0);
    }

    // Public API
    return {
        init,
        showAddNutritionForm,
        hideAddNutritionForm,
        viewDetails,
        deleteNutrition,
        getByAnimal,
        getByDateRange,
        getTotalForagePeriod,
        getTotalConcentratesPeriod,
        getAll,
        loadNutrition,
        renderNutrition
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Nutrition.init();
});
