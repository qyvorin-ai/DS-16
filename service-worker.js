const CACHE_NAME = 'ds16-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/src/styles/index.css',
    '/src/app.js',
    '/src/services/db.js',
    '/src/services/auth.js',
    '/src/pages/login.js',
    '/src/pages/employee-dashboard.js',
    '/src/pages/admin-dashboard.js',
    '/src/pages/employee-history.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});
