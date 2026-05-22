// ==================== MAIN APPLICATION MODULE ====================
// Main entry point and application controller

const App = (() => {
    const FARM_SETTINGS_KEY = 'farmSettings';

    // Initialize app
    function init() {
        console.log('Initializing Farm Manager App...');
        setupNavigation();
        setupSettings();
        updateDashboard();
        // Auto-update dashboard every 5 seconds
        setInterval(updateDashboard, 5000);
    }

    // Setup navigation
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab');
                switchTab(tabName);
                
                // Close sidebar on mobile after clicking
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
        });

        // Mobile menu toggle
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
                overlay.classList.add('active');
            });
        }

        // Overlay click to close
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        // Set dashboard as default
        switchTab('dashboard');
    }

    // Switch tabs
    function switchTab(tabName) {
        // Hide all tabs
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Set active nav link
        const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update page title
        const titleMap = {
            dashboard: 'Dashboard',
            animals: 'Animals Management',
            vaccinations: 'Vaccination Records',
            production: 'Milk Production',
            health: 'Health & Veterinary',
            nutrition: 'Nutrition Management',
            deworming: 'Deworming Schedule',
            breeding: 'Breeding & Pregnancy',
            sales: 'Sales & Income',
            expenses: 'Expenses',
            employees: 'Employees',
            reports: 'Reports & Analytics',
            settings: 'Settings ⚙️',
            'data-management': 'Data Management 💾'
        };

        document.getElementById('page-title').textContent = titleMap[tabName] || 'Dashboard';

        // Update charts when switching to specific tabs
        if (tabName === 'reports') {
            setTimeout(() => {
                Charts.updateAll();
            }, 100);
        }

        if (tabName === 'production') {
            setTimeout(() => {
                Charts.updateProductionTrendChart();
            }, 100);
        }

        if (tabName === 'dashboard') {
            setTimeout(() => {
                Charts.updateDashboardCharts();
            }, 100);
        }

        if (tabName === 'data-management') {
            DataManagement.init();
        }
    }

    // Update dashboard
    function updateDashboard() {
        // Update total animals
        const totalAnimals = Animals.getAll().length;
        const totalAnimalsEl = document.getElementById('total-animals');
        if (totalAnimalsEl) {
            totalAnimalsEl.textContent = totalAnimals;
        }

        // Update daily milk
        const todayMilk = Production.getTodayTotal();
        const dailyMilkEl = document.getElementById('daily-milk');
        if (dailyMilkEl) {
            dailyMilkEl.textContent = todayMilk.toFixed(2) + 'L';
        }

        // Update vaccines due
        const vaccinesDue = Vaccinations.getOverdue().length + Vaccinations.getDueSoon().length;
        const vaccinesDueEl = document.getElementById('vaccines-due');
        if (vaccinesDueEl) {
            vaccinesDueEl.textContent = vaccinesDue;
        }

        // Update deworming due
        const dewormingDue = Deworming.getOverdue().length + Deworming.getDueSoon().length;
        const dewormingDueEl = document.getElementById('deworming-due');
        if (dewormingDueEl) {
            dewormingDueEl.textContent = dewormingDue;
        }

        // Update sales metrics
        if (typeof Sales !== 'undefined' && Sales.getTotalIncome) {
            const monthlyIncome = Sales.getMonthlyIncome();
            const incomeEl = document.getElementById('monthly-income');
            if (incomeEl) {
                incomeEl.textContent = `KES ${monthlyIncome.toFixed(2)}`;
            }
        }

        // Update expenses metrics
        if (typeof Expenses !== 'undefined' && Expenses.getTotalExpenses) {
            const monthlyExpenses = Expenses.getMonthlyExpenses();
            const expensesEl = document.getElementById('monthly-expenses');
            if (expensesEl) {
                expensesEl.textContent = `KES ${monthlyExpenses.toFixed(2)}`;
            }
        }

        // Update health metrics
        if (typeof Health !== 'undefined' && Health.getSickAnimals) {
            const sickAnimals = Health.getSickAnimals().length;
            const healthEl = document.getElementById('sick-animals');
            if (healthEl) {
                healthEl.textContent = sickAnimals;
            }
        }

        // Update breeding metrics
        if (typeof Breeding !== 'undefined' && Breeding.getPregnantAnimals) {
            const pregnantAnimals = Breeding.getPregnantAnimals().length;
            const breedingEl = document.getElementById('pregnant-animals');
            if (breedingEl) {
                breedingEl.textContent = pregnantAnimals;
            }
        }

        // Update employee metrics
        if (typeof Employees !== 'undefined' && Employees.getActive) {
            const activeEmployees = Employees.getActive().length;
            const employeesEl = document.getElementById('active-employees');
            if (employeesEl) {
                employeesEl.textContent = activeEmployees;
            }
        }

        // Update charts if dashboard is active
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            Charts.updateDashboardCharts();
            updateUpcomingTasks();
        }
    }

    // Update upcoming tasks display
    function updateUpcomingTasks() {
        const tasksList = document.getElementById('upcoming-tasks-list');
        if (!tasksList) return;

        const tasks = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Get Vaccinations
        if (typeof Vaccinations !== 'undefined') {
            Vaccinations.getAll().forEach(v => {
                if (v.nextDueDate) {
                    const dueDate = new Date(v.nextDueDate);
                    const animal = Animals.getById(v.animalId);
                    tasks.push({
                        title: `Vaccination: ${v.vaccineType}`,
                        animal: animal ? animal.name : 'Unknown',
                        date: dueDate,
                        icon: '💉',
                        type: 'vaccine'
                    });
                }
            });
        }

        // 2. Get Deworming
        if (typeof Deworming !== 'undefined') {
            Deworming.getAll().forEach(d => {
                if (d.nextDueDate) {
                    const dueDate = new Date(d.nextDueDate);
                    const animal = Animals.getById(d.animalId);
                    tasks.push({
                        title: `Deworming: ${d.brand}`,
                        animal: animal ? animal.name : 'Unknown',
                        date: dueDate,
                        icon: '💊',
                        type: 'deworming'
                    });
                }
            });
        }

        // 3. Get Breeding (Pregnancy Due Dates)
        if (typeof Breeding !== 'undefined') {
            Breeding.getAll().forEach(b => {
                if (b.status === 'pregnant' && b.expectedDueDate) {
                    const dueDate = new Date(b.expectedDueDate);
                    const animal = Animals.getById(b.animalId);
                    tasks.push({
                        title: 'Expected Calving',
                        animal: animal ? animal.name : 'Unknown',
                        date: dueDate,
                        icon: '🤰',
                        type: 'breeding'
                    });
                }
            });
        }

        // Sort by date
        tasks.sort((a, b) => a.date - b.date);

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="empty-msg">No upcoming tasks scheduled.</p>';
            return;
        }

        tasksList.innerHTML = tasks.map(task => {
            const diffDays = Math.ceil((task.date - today) / (1000 * 60 * 60 * 24));
            let urgency = 'green';
            
            if (diffDays < 0) urgency = 'red'; // Overdue
            else if (diffDays <= 7) urgency = 'yellow'; // Due within a week
            
            const dateStr = task.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

            return `
                <div class="task-item task-urgency-${urgency}">
                    <div class="task-icon">${task.icon}</div>
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">${task.animal}</div>
                    </div>
                    <div class="task-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    // Setup settings
    function setupSettings() {
        const farmSettingsForm = document.getElementById('farm-settings-form');

        if (farmSettingsForm) {
            // Load existing settings
            const settings = Storage.get(FARM_SETTINGS_KEY, {
                farmName: '',
                farmLocation: '',
                farmContact: ''
            });

            document.getElementById('farm-name').value = settings.farmName || '';
            document.getElementById('farm-location').value = settings.farmLocation || '';
            document.getElementById('farm-contact').value = settings.farmContact || '';

            // Save settings on form submit
            farmSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const newSettings = {
                    farmName: document.getElementById('farm-name').value,
                    farmLocation: document.getElementById('farm-location').value,
                    farmContact: document.getElementById('farm-contact').value
                };

                Storage.set(FARM_SETTINGS_KEY, newSettings);
                showNotification('Settings saved successfully!', 'success');

                // Update user name if provided
                if (newSettings.farmName) {
                    document.getElementById('user-name').textContent = newSettings.farmName;
                }
            });

            // Set user name if available
            if (settings.farmName) {
                document.getElementById('user-name').textContent = settings.farmName;
            }
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    // Handle logout
    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            Storage.clear();
            window.location.reload();
        }
    }

    // Get app state (for debugging/export)
    function getAppState() {
        return {
            animals: Animals.getAll(),
            vaccinations: Vaccinations.getAll(),
            production: Production.getAll(),
            nutrition: Nutrition.getAll(),
            deworming: Deworming.getAll(),
            settings: Storage.get(FARM_SETTINGS_KEY, {})
        };
    }

    // Export data to JSON
    function exportData() {
        const data = getAppState();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    }

    // Import data from JSON
    function importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.animals) Storage.set('animals', data.animals);
                if (data.vaccinations) Storage.set('vaccinations', data.vaccinations);
                if (data.production) Storage.set('production', data.production);
                if (data.nutrition) Storage.set('nutrition', data.nutrition);
                if (data.deworming) Storage.set('deworming', data.deworming);
                if (data.settings) Storage.set(FARM_SETTINGS_KEY, data.settings);

                showNotification('Data imported successfully! Please refresh the page.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error('Error importing data:', error);
                showNotification('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Print current view
    function printCurrentView() {
        window.print();
    }

    // Public API
    return {
        init,
        switchTab,
        updateDashboard,
        getAppState,
        exportData,
        importData,
        printCurrentView
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: Print
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            App.printCurrentView();
        }
        
        // Ctrl/Cmd + E: Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            App.exportData();
        }
    });

    // Initialize all modules
    setTimeout(() => {
        App.init();
    }, 100);
});

// Expose global functions for debugging
window.App = App;
window.Animals = Animals;
window.Vaccinations = Vaccinations;
window.Production = Production;
window.Nutrition = Nutrition;
window.Deworming = Deworming;
window.Health = Health;
window.Breeding = Breeding;
window.Sales = Sales;
window.Expenses = Expenses;
window.Employees = Employees;
window.Charts = Charts;

// Expose updateDashboard globally for modules
window.updateDashboard = () => App.updateDashboard();
window.Vaccinations = Vaccinations;
window.Production = Production;
window.Nutrition = Nutrition;
window.Deworming = Deworming;
window.Charts = Charts;
