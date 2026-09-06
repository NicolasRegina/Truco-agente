// Truco Argentino - Progressive Web App Service Worker
// Enables 100% offline gameplay (vs Bot, profile caching, sounds, cards)

const CACHE_NAME = 'truco-pro-offline-v1';

// Core assets required to run the game offline
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-64x64.png',
  '/icons/apple-touch-icon.png',
  '/themes/gaucho/table_bg.jpg',
  '/themes/gaucho/card_back.jpg',
  '/card_backs/card_clasico.jpg',
  '/card_backs/card_gold.jpg',
  '/card_backs/card_pampa.jpg',
  '/card_backs/card_rojo.jpg',
  '/card_backs/card_sol.jpg',
  // Gaucho deck (all 40 Spanish cards)
  '/themes/gaucho/cards/basto_1.jpg',
  '/themes/gaucho/cards/basto_2.jpg',
  '/themes/gaucho/cards/basto_3.jpg',
  '/themes/gaucho/cards/basto_4.jpg',
  '/themes/gaucho/cards/basto_5.jpg',
  '/themes/gaucho/cards/basto_6.jpg',
  '/themes/gaucho/cards/basto_7.jpg',
  '/themes/gaucho/cards/basto_10.jpg',
  '/themes/gaucho/cards/basto_11.jpg',
  '/themes/gaucho/cards/basto_12.jpg',
  '/themes/gaucho/cards/copa_1.jpg',
  '/themes/gaucho/cards/copa_2.jpg',
  '/themes/gaucho/cards/copa_3.jpg',
  '/themes/gaucho/cards/copa_4.jpg',
  '/themes/gaucho/cards/copa_5.jpg',
  '/themes/gaucho/cards/copa_6.jpg',
  '/themes/gaucho/cards/copa_7.jpg',
  '/themes/gaucho/cards/copa_10.jpg',
  '/themes/gaucho/cards/copa_11.jpg',
  '/themes/gaucho/cards/copa_12.jpg',
  '/themes/gaucho/cards/espada_1.jpg',
  '/themes/gaucho/cards/espada_2.jpg',
  '/themes/gaucho/cards/espada_3.jpg',
  '/themes/gaucho/cards/espada_4.jpg',
  '/themes/gaucho/cards/espada_5.jpg',
  '/themes/gaucho/cards/espada_6.jpg',
  '/themes/gaucho/cards/espada_7.jpg',
  '/themes/gaucho/cards/espada_10.jpg',
  '/themes/gaucho/cards/espada_11.jpg',
  '/themes/gaucho/cards/espada_12.jpg',
  '/themes/gaucho/cards/oro_1.jpg',
  '/themes/gaucho/cards/oro_2.jpg',
  '/themes/gaucho/cards/oro_3.jpg',
  '/themes/gaucho/cards/oro_4.jpg',
  '/themes/gaucho/cards/oro_5.jpg',
  '/themes/gaucho/cards/oro_6.jpg',
  '/themes/gaucho/cards/oro_7.jpg',
  '/themes/gaucho/cards/oro_10.jpg',
  '/themes/gaucho/cards/oro_11.jpg',
  '/themes/gaucho/cards/oro_12.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache critical assets resiliently (don't reject all if one 404s)
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url)
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn('[SW] Precache skipped:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and WebSocket / API calls
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return;
  if (url.protocol.startsWith('ws')) return;

  // SPA Navigation: Serve cached index.html when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html') || await cache.match('/');
          if (cachedIndex) return cachedIndex;
          return new Response('Modo Offline Activo', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static Assets (Vite chunks, JS, CSS, images, cards, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache immediately, optionally revalidate in background if online
        if (navigator.onLine) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      // If not cached, fetch from network and cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback for image requests offline
          if (request.destination === 'image') {
            const cache = await caches.open(CACHE_NAME);
            const fallbackCard = await cache.match('/themes/gaucho/card_back.jpg');
            if (fallbackCard) return fallbackCard;
          }
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        });
    })
  );
});
