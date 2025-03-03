// service-worker.js
const CACHE_NAME = 'wyzwanie2025-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
];

// Instalacja Service Workera
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalacja');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cachowanie zasobów');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktywacja Service Workera
self.addEventListener('activate', event => {
  console.log('[Service Worker] Aktywacja');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Obsługa żądań
self.addEventListener('fetch', event => {
  // Nie cache'uj żądań do Firebase lub Strava
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('api.strava.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Zwróć z cache jeśli istnieje
        if (response) {
          return response;
        }
        
        // W przeciwnym razie pobierz z sieci
        return fetch(event.request)
          .then(response => {
            // Sprawdź czy odpowiedź jest poprawna
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Sklonuj odpowiedź
            var responseToCache = response.clone();
            
            // Zapisz do cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // Zwróć fallback dla HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
});
