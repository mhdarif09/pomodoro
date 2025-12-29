const CACHE_NAME = 'pomodoro-cache-v6';
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
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const isHtml = event.request.mode === 'navigate' ||
        event.request.headers.get('X-Inertia') === 'true';

    // Strategy: Network First for HTML/Inertia
    if (isHtml) {
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
                .catch(async () => {
                    const cached = await caches.match(event.request);
                    if (cached) return cached;

                    // If no cache and no network, we must return something valid or let it fail naturally.
                    // But since we are in respondWith, we should probably throw or return a response.
                    // Throwing in the catch will result in a generic network error, which is better than a TypeError.
                    throw new Error('Offline and no cache available');
                })
        );
        return;
    }

    // Assets: Cache-First strategy
    if (event.request.destination === 'style' ||
        event.request.destination === 'script' ||
        event.request.destination === 'image') {
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
});
