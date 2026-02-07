const CACHE_NAME = 'kettlebell-v5';
const BASE = '/gym_app';
const PRECACHE_FILES = __PRECACHE_FILES__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_FILES))
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
  const isNavigate = event.request.mode === 'navigate';
  event.respondWith(
    caches.match(event.request, { ignoreSearch: isNavigate }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (isNavigate) {
        return caches.match(BASE + '/');
      }
    })
  );
});
