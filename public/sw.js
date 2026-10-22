// HealthThread PWA Service Worker
const CACHE_NAME = 'healththread-app-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/favicon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/maskable-icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[HealthThread SW] Pre-caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip chrome-extension/api/HMR requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          const cachedHome = await caches.match('/');
          if (cachedHome) return cachedHome;
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>HealthThread — Offline</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090e17; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
                .card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 168, 150, 0.3); border-radius: 20px; padding: 36px 28px; max-width: 440px; box-shadow: 0 10px 40px rgba(0, 168, 150, 0.15); }
                h1 { color: #00a896; font-size: 24px; margin-bottom: 12px; }
                p { color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
                button { background: #00a896; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                button:hover { background: #028090; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>HealthThread</h1>
                <p>You appear to be offline. Cached medical records and emergency profile remain accessible when loaded, and full features will reconnect once your internet connection is restored.</p>
                <button onclick="window.location.reload()">Retry Connection</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('Offline - HealthThread', { status: 503, statusText: 'Offline' });
      })
  );
});
