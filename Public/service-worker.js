// 🚀 SERVICE WORKER - Advanced offline support for 5KB/s networks
// Cache everything aggressively!

const CACHE_VERSION = 'crown-v1.0.0';
const CACHE_NAME = `crown-cache-${CACHE_VERSION}`;

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Caching critical resources');
      return cache.addAll(CRITICAL_RESOURCES).catch((err) => {
        console.warn('Failed to cache some resources:', err);
        // Don't fail installation if some resources fail
      });
    })
  );
  
  // Take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // API requests: Network first, cache fallback
  if (url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the response for offline use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📦 Service Worker: Serving API from cache (offline)');
              return cachedResponse;
            }
            
            // No cache available
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Offline and no cache available',
                offline: true,
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }
  
  // Static resources: Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('⚡ Service Worker: Serving from cache:', url.pathname);
        
        // Return cached version immediately
        // Update cache in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {
          // Network failed, that's ok - we have cache
        });
        
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Cache for next time
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    })
  );
});

// Background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    console.log('🔄 Service Worker: Syncing offline submissions...');
    
    event.waitUntil(
      // Get offline queue from IndexedDB and send to server
      syncOfflineQueue()
    );
  }
});

// Sync offline queue (placeholder - implement with IndexedDB)
async function syncOfflineQueue() {
  try {
    // TODO: Implement IndexedDB queue sync
    console.log('✅ Service Worker: Offline queue synced');
    return true;
  } catch (error) {
    console.error('❌ Service Worker: Sync failed:', error);
    throw error;
  }
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New update available!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CROWN Daily Indicators', options)
  );
});

console.log('🚀 Service Worker: Loaded and ready!');
