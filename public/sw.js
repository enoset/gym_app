const CACHE_NAME = 'kettlebell-v7';
const BASE = '/gym_app';
const PRECACHE_FILES = __PRECACHE_FILES__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_FILES.map((url) =>
          cache.add(url).catch(() => {
            console.warn('SW: failed to precache', url);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isNavigate = request.mode === 'navigate';

  event.respondWith(
    caches.match(request, { ignoreSearch: isNavigate }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        if (isNavigate) {
          return caches.match(BASE + '/');
        }
        return caches.match(request, { ignoreSearch: true }).then((fallback) => {
          if (fallback) return fallback;
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        });
      });
    })
  );
});
