const CACHE_NAME = 'astrid-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon-32.png',
  './favicon-48.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Network-first: always try to fetch the latest version when online (so updates
// show up immediately), and only fall back to the cached copy when offline.
self.addEventListener('fetch', function (e) {
  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, copy);
        });
        return response;
      })
      .catch(function () {
        return caches.match(e.request);
      })
  );
});
