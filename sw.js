// ==================== AUTO-SAVE SERVICE WORKER ====================
// Handles offline caching and instant data persistence

const CACHE_NAME = 'farm-manager-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/utils.js',
    '/js/animals.js',
    '/js/vaccinations.js',
    '/js/production.js',
    '/js/nutrition.js',
    '/js/deworming.js',
    '/js/charts.js',
    '/js/config.js'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.log('Cache install failed:', err))
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response
                const responseClone = response.clone();
                
                // Cache successful requests
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                
                return response;
            })
            .catch(() => {
                // Return cached version if network fails
                return caches.match(event.request)
                    .then(response => response || new Response('Offline'));
            })
    );
});

// Listen for sync events (background sync)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Sync data function
function syncData() {
    return new Promise((resolve, reject) => {
        // Get all data from localStorage
        const data = {
            animals: localStorage.getItem('animals'),
            vaccinations: localStorage.getItem('vaccinations'),
            production: localStorage.getItem('production'),
            nutrition: localStorage.getItem('nutrition'),
            deworming: localStorage.getItem('deworming'),
            timestamp: new Date().toISOString()
        };
        
        // Send to server (if online)
        fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(() => resolve())
        .catch(() => resolve()); // Fail silently for offline
    });
}
