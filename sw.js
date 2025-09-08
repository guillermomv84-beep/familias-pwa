
const CACHE_NAME = 'familias-cache-v2';
const INDEX_V = './index.html?v=2';
const ASSETS = [
  './',
  INDEX_V,
  './manifest.webmanifest',
  './sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k!==CACHE_NAME) && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navegaciones: entregar la nueva versión cacheada
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(INDEX_V).then(cached => cached || fetch(INDEX_V))
    );
    return;
  }

  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => cached);
    })
  );
});
