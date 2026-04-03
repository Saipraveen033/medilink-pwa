// ===============================
// MEDILINK SERVICE WORKER
// Handles offline functionality, caching, and background sync
// ===============================

const CACHE_NAME = 'medilink-v1.0.0';
const RUNTIME_CACHE = 'medilink-runtime-v1.0.0';
const IMAGE_CACHE = 'medilink-images-v1.0.0';
const API_CACHE = 'medilink-api-v1.0.0';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/patient.html',
  '/doctor.html',
  '/hospital.html',
  '/hospital-admin.html',
  '/profile.html',
  '/nfc-tester.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/supabase-config.js',
  '/offline.html'
];

// ===============================
// SERVICE WORKER: INSTALL
// ===============================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Installation error:', error);
      })
  );
});

// ===============================
// SERVICE WORKER: ACTIVATE
// ===============================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== IMAGE_CACHE &&
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim(); // Take control of all open pages
      })
  );
});

// ===============================
// SERVICE WORKER: FETCH
// Cache-first strategy with network fallback
// ===============================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip localhost API calls (development)
  if (url.origin.includes('localhost') && url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const cache = caches.open(API_CACHE);
            cache.then((c) => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if offline
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || createOfflineResponse('API');
            });
        })
    );
    return;
  }

  // API requests to external services - network first
  if (url.origin.includes('supabase') || url.origin.includes('api')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const cache = caches.open(API_CACHE);
            cache.then((c) => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || createOfflineResponse('API', event.request.url);
            });
        })
    );
    return;
  }

  // Image requests - cache first
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                const cache = caches.open(IMAGE_CACHE);
                cache.then((c) => c.put(event.request, response.clone()));
              }
              return response;
            })
            .catch(() => {
              // Return placeholder image if offline
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <rect fill="#e0e0e0" width="100" height="100"/>
                  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="12">Offline</text>
                </svg>`,
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        })
    );
    return;
  }

  // CSS and JS files - cache first with network fallback
  if (event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                const cache = caches.open(RUNTIME_CACHE);
                cache.then((c) => c.put(event.request, response.clone()));
              }
              return response;
            });
        })
    );
    return;
  }

  // HTML documents - network first with cache fallback
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Default strategy - cache first
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const cache = caches.open(RUNTIME_CACHE);
              cache.then((c) => c.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});

// ===============================
// BACKGROUND SYNC (for offline actions)
// ===============================
self.addEventListener('sync', (event) => {
  console.log('📤 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-medical-records') {
    event.waitUntil(syncMedicalRecords());
  } else if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

// Helper function for syncing medical records
async function syncMedicalRecords() {
  try {
    console.log('🔄 Syncing medical records...');
    // Retrieve offline actions from IndexedDB
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db, 'records');
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        await removeOfflineAction(db, 'records', action.id);
      } catch (error) {
        console.error('❌ Sync error:', error);
      }
    }
    
    console.log('✅ Medical records synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error; // Retry
  }
}

// Helper function for syncing appointments
async function syncAppointments() {
  try {
    console.log('🔄 Syncing appointments...');
    // Similar to syncMedicalRecords
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db, 'appointments');
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        await removeOfflineAction(db, 'appointments', action.id);
      } catch (error) {
        console.error('❌ Sync error:', error);
      }
    }
    
    console.log('✅ Appointments synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MediLinkDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id' });
      }
    };
  });
}

async function getOfflineActions(db, type) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const actions = request.result.filter(a => a.type === type);
      resolve(actions);
    };
  });
}

async function removeOfflineAction(db, type, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ===============================
// OFFLINE RESPONSE HELPER
// ===============================
function createOfflineResponse(type = 'General', url = '') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - MediLink</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .offline-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            text-align: center;
          }
          .offline-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          h1 { color: #333; margin: 0; }
          p { color: #666; margin: 1rem 0 0 0; }
          .status-type { color: #0066cc; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📡</div>
          <h1>You're Offline</h1>
          <p><span class="status-type">${type}</span> is not available right now.</p>
          <p>Please check your internet connection and try again.</p>
          <p style="font-size: 0.85rem; color: #999; margin-top: 2rem;">
            Some features may still work offline using cached data.
          </p>
        </div>
      </body>
    </html>
  `;
  
  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// ===============================
// PUSH NOTIFICATIONS
// ===============================
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const options = {
    title: data.title || 'MediLink Notification',
    body: data.body || 'You have a new notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.title);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow('/index.html');
      }
    })
  );
});

console.log('✅ Service Worker loaded');
