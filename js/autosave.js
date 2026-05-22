// ==================== AUTO-SAVE MODULE ====================
// Handles instant data persistence and real-time saving

const AutoSave = (() => {
    const SAVE_INTERVAL = 1000; // Save every 1 second
    const AUTO_SAVE_KEY = 'farm_autosave_';
    let saveTimeout = null;
    let lastSaveTime = 0;

    // Initialize auto-save
    function init() {
        console.log('🔄 Auto-Save Module Initialized');
        
        // Register service worker for offline support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✓ Service Worker registered'))
                .catch(err => console.log('Service Worker error:', err));
        }
        
        // Listen to all data changes
        setupAutoSaveListeners();
        
        // Periodic backup every 5 minutes
        setInterval(backupData, 300000);
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
                saveAllData();
            }
        });
    }

    // Setup auto-save listeners
    function setupAutoSaveListeners() {
        // Listen to all form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form && form.id) {
                scheduleAutoSave(`form-${form.id}`, form);
            }
        }, true);

        // Listen to all input changes
        document.addEventListener('input', (e) => {
            if (e.target && e.target.name) {
                scheduleAutoSave(`input-${e.target.name}`, e.target);
            }
        }, true);

        // Listen to select changes
        document.addEventListener('change', (e) => {
            if (e.target && e.target.name) {
                scheduleAutoSave(`change-${e.target.name}`, e.target);
            }
        }, true);
    }

    // Schedule auto-save with debounce
    function scheduleAutoSave(key, data) {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        saveTimeout = setTimeout(() => {
            saveData(key, data);
            showSaveIndicator();
        }, SAVE_INTERVAL);
    }

    // Save individual data
    function saveData(key, data) {
        try {
            const timestamp = new Date().toISOString();
            const saveData = {
                data: data.value || data.textContent || JSON.stringify(data),
                timestamp: timestamp
            };
            
            localStorage.setItem(AUTO_SAVE_KEY + key, JSON.stringify(saveData));
            lastSaveTime = Date.now();
            
            console.log(`✓ Saved: ${key}`);
        } catch (error) {
            console.error('Auto-save error:', error);
            showSaveError(error.message);
        }
    }

    // Save all data
    function saveAllData() {
        try {
            const allData = {
                animals: localStorage.getItem('animals'),
                vaccinations: localStorage.getItem('vaccinations'),
                production: localStorage.getItem('production'),
                nutrition: localStorage.getItem('nutrition'),
                deworming: localStorage.getItem('deworming'),
                employees: localStorage.getItem('employees'),
                expenses: localStorage.getItem('expenses'),
                sales: localStorage.getItem('sales'),
                health: localStorage.getItem('health'),
                breeding: localStorage.getItem('breeding'),
                farmSettings: localStorage.getItem('farmSettings'),
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            localStorage.setItem('farm_complete_backup', JSON.stringify(allData));
            console.log('✓ Complete backup saved');
            return allData;
        } catch (error) {
            console.error('Backup error:', error);
            return null;
        }
    }

    // Backup data
    function backupData() {
        const backup = saveAllData();
        if (backup) {
            console.log('📦 Automatic backup completed');
            showNotification('✓ Auto-backup completed', 'success');
        }
    }

    // Show save indicator
    function showSaveIndicator() {
        let indicator = document.getElementById('save-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'save-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 15px;
                background-color: #2ecc71;
                color: white;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                animation: fadeInOut 2s ease-in-out;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = '💾 Saving...';
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.textContent = '✓ Saved';
            indicator.style.opacity = '0.8';
        }, 500);
        
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 1500);
    }

    // Show save error
    function showSaveError(message) {
        showNotification(`⚠️ Save error: ${message}`, 'error');
    }

    // Restore data from backup
    function restoreData() {
        try {
            const backup = localStorage.getItem('farm_complete_backup');
            if (backup) {
                const data = JSON.parse(backup);
                
                Object.keys(data).forEach(key => {
                    if (key !== 'timestamp' && key !== 'version' && data[key]) {
                        localStorage.setItem(key, data[key]);
                    }
                });
                
                console.log('✓ Data restored from backup');
                showNotification('✓ Data restored from backup', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    }

    // Export data
    function exportData() {
        const backup = saveAllData();
        if (!backup) return;
        
        const filename = `farm-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        console.log(`✓ Data exported: ${filename}`);
        showNotification(`✓ Data exported: ${filename}`, 'success');
    }

    // Get save status
    function getSaveStatus() {
        return {
            lastSaveTime: lastSaveTime,
            timeSinceLastSave: Date.now() - lastSaveTime,
            storageUsed: JSON.stringify(localStorage).length,
            backupExists: !!localStorage.getItem('farm_complete_backup')
        };
    }

    // Public API
    return {
        init,
        saveAllData,
        restoreData,
        exportData,
        getSaveStatus,
        backupData
    };
})();

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AutoSave.init);
} else {
    AutoSave.init();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+E / Cmd+E: Export data
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        AutoSave.exportData();
    }
    
    // Ctrl+S / Cmd+S: Save all data
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        AutoSave.saveAllData();
        showNotification('✓ Data saved', 'success');
    }
});
