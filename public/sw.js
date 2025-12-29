const CACHE_NAME = 'pomodoro-cache-v7';
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
    // We only care about GET requests for now
    if (event.request.method !== 'GET') {
        return;
    }

    const isHtml = event.request.mode === 'navigate' ||
        event.request.headers.get('X-Inertia') === 'true';

    if (isHtml) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful same-origin responses
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(event.request);
                    if (cached) return cached;

                    // Return a valid Response object instead of throwing/returning undefined
                    return new Response('Network error occurred. Please refresh the page.', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({ 'Content-Type': 'text/plain' })
                    });
                })
        );
        return;
    }

    // Assets strategy: Cache-first, then network
    const isAsset = event.request.destination === 'style' ||
        event.request.destination === 'script' ||
        event.request.destination === 'image';

    if (isAsset) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;

                return fetch(event.request).then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => {
                    // Minimal valid response for assets
                    return new Response('', { status: 404 });
                });
            })
        );
    }
});
