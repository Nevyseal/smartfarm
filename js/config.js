// ==================== FIREBASE CONFIGURATION ====================
// This file contains Firebase configuration and initialization

const firebaseConfig = {
    apiKey: "AIzaSyCnq9pIuYfvlLaR84ehXsDI05q4IltkKOM",
    authDomain: "smartfram-5463c.firebaseapp.com",
    projectId: "smartfram-5463c",
    storageBucket: "smartfram-5463c.firebasestorage.app",
    messagingSenderId: "992594030301",
    appId: "1:992594030301:web:f3545a99e481bda4acb534",
    measurementId: "G-Q158M79VMQ"
};

// Initialize Firebase
let db = null;
let auth = null;
let analytics = null;

function initializeFirebase() {
    try {
        // Only initialize if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully with project: smartfram-5463c');
            
            // Initialize analytics if supported and not blocked
            if (firebase.analytics) {
                try {
                    analytics = firebase.analytics();
                    console.log('✓ Firebase Analytics Initialized');
                } catch (e) {
                    console.warn('Firebase Analytics blocked or not supported:', e.message);
                }
            }
        }
        
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Enable offline persistence for Firestore
        db.enablePersistence().then(() => {
            console.log('✓ Firestore Persistence Enabled');
        }).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Persistence failed: multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.warn('Persistence is not available in this browser');
            }
        });

        // Test database connection
        db.collection('animals').limit(1).get()
            .then(() => {
                console.log('🔥 Firebase Database Connection: SUCCESS');
                updateDbStatus(true);
            })
            .catch(err => {
                console.error('❌ Firebase Database Connection: FAILED', err);
                updateDbStatus(false);
            });
        
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        updateDbStatus(false);
        return false;
    }
}

// Update Database Status UI
function updateDbStatus(isOnline) {
    const statusEl = document.getElementById('db-status');
    if (!statusEl) return;

    if (isOnline) {
        statusEl.className = 'db-status connection-online';
        statusEl.querySelector('.status-text').textContent = 'Cloud Database: Online';
    } else {
        statusEl.className = 'db-status connection-offline';
        statusEl.querySelector('.status-text').textContent = 'Cloud Database: Offline';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (firebase) {
        initializeFirebase();
    }
});

// Get Firestore instance
function getDb() {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    return db;
}

// Get Auth instance
function getAuth() {
    if (!auth) {
        console.error('Firebase not initialized');
        return null;
    }
    return auth;
}
