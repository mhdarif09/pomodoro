const CACHE_NAME = 'pomodoro-cache-v5';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/sw.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const isHtml = event.request.mode === 'navigate' ||
        event.request.headers.get('X-Inertia') === 'true';

    // Only cache GET requests for HTML/Inertia
    if (isHtml && event.request.method === 'GET') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Assets: Cache-First strategy
    if (event.request.method === 'GET' && (
        event.request.destination === 'style' ||
        event.request.destination === 'script' ||
        event.request.destination === 'image')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
                    return response;
                });
            })
        );
        return;
    }

    // Non-GET or other requests: Network-Only
    event.respondWith(fetch(event.request));
});
