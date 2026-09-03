const CACHE_NAME = 'oreo-finance-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/oreo.svg',
  '/oreo.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let the browser handle Supabase API requests and Next.js HMR
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.includes('/api/') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset for static files
        return cachedResponse;
      }

      // Otherwise try the network
      return fetch(event.request).catch(() => {
        // If network fails and it's a page navigation, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        // For other failed requests, just let it fail
        return new Response('', { status: 408, statusText: 'Request timeout.' });
      });
    })
  );
});
