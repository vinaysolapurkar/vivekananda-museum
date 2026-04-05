const CACHE_NAME = 'audio-guide-v1';
const AUDIO_CACHE = 'audio-files-v1';

const APP_SHELL = [
  '/guide',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/manifest.json',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio files: cache when played, serve from cache if available
  if (url.pathname.startsWith('/uploads/audio/') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.m4a')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Guide pages: network-first with cache fallback
  if (url.pathname.startsWith('/guide')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // API requests for stations: network-first with cache fallback
  if (url.pathname.startsWith('/api/audio/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Message handler for cache operations from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const audioUrl = event.data.url;
    caches.open(AUDIO_CACHE).then((cache) => {
      cache.match(audioUrl).then((existing) => {
        if (!existing) {
          fetch(audioUrl).then((response) => {
            if (response.ok) {
              cache.put(audioUrl, response);
              // Notify all clients that audio is cached
              self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                  client.postMessage({ type: 'AUDIO_CACHED', url: audioUrl });
                });
              });
            }
          });
        } else {
          // Already cached, notify
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ type: 'AUDIO_CACHED', url: audioUrl });
            });
          });
        }
      });
    });
  }

  if (event.data && event.data.type === 'CHECK_AUDIO_CACHED') {
    const audioUrl = event.data.url;
    caches.open(AUDIO_CACHE).then((cache) => {
      cache.match(audioUrl).then((existing) => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'AUDIO_CACHE_STATUS',
              url: audioUrl,
              cached: !!existing,
            });
          });
        });
      });
    });
  }
});
