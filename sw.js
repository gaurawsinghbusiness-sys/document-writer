/**
 * DocumentWriter Service Worker
 * Caches the app shell for offline use
 */
const CACHE_NAME   = 'documentwriter-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/editor.css',
  '/css/toolbar.css',
  '/css/sidebar.css',
  '/css/blocks.css',
  '/css/modals.css',
  '/css/themes.css',
  '/css/writer-mode.css',
  '/css/features.css',
  '/css/image-editor.css',
  '/js/storage.js',
  '/js/editor.js',
  '/js/toolbar.js',
  '/js/chapters.js',
  '/js/export.js',
  '/js/export-pro.js',
  '/js/themes.js',
  '/js/page-system.js',
  '/js/writer-mode.js',
  '/js/stats.js',
  '/js/image-manager.js',
  '/js/features.js',
  '/js/app.js',
  '/core/wow-features.js',
];

/* ── Install: cache shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ── Activate: purge old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: cache-first for shell, network-first for rest ── */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always fetch external images from network (no CORS complications)
  if (event.request.destination === 'image' && url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful same-origin responses
        if (
          response.ok &&
          url.origin === self.location.origin &&
          event.request.method === 'GET'
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
