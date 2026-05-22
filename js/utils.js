// ==================== UTILITY FUNCTIONS ====================
// Common utility functions used throughout the application

// Date formatting
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDatetime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Get date string in YYYY-MM-DD format
function getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// Calculate days between two dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Check if a date is overdue
function isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}

// Check if a date is due soon (within 7 days)
function isDueSoon(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = daysBetween(today, due);
    return daysUntilDue <= 7 && daysUntilDue >= 0;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#f39c12'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show loading spinner
function showLoader(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    loader.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #2ecc71; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; margin-bottom: 15px;"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(loader);
}

// Hide loader
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

// Local Storage helpers
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate average
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return (sum / numbers.length).toFixed(2);
}

// Get animal emoji
function getAnimalEmoji(animalType) {
    const emojis = {
        'cow': '🐄',
        'sheep': '🐑',
        'goat': '🐐'
    };
    return emojis[animalType] || '🐾';
}

// Format animal type
function formatAnimalType(type) {
    const types = {
        'cow': '<i>Bovine</i>(Cattle)-Cows & Bulls',
        'sheep': '<i>Ovine</i> (Sheep) -Ram &ewes',
        'goat': '<i>Caprine</i> (Goats) -Bucks &Does'
    };
    return types[type] || type;
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatDatetime,
        getDateString,
        daysBetween,
        isOverdue,
        isDueSoon,
        showNotification,
        showLoader,
        hideLoader,
        Storage,
        generateId,
        formatNumber,
        calculateAverage,
        getAnimalEmoji,
        formatAnimalType,
        isValidEmail,
        isValidPhone
    };
}
