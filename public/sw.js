// public/sw.js
const CACHE_NAME = 'spotlylb-cache-v1.0.0';
const API_CACHE_NAME = 'spotlylb-api-cache-v1.0.0';
const IMAGE_CACHE_NAME = 'spotlylb-images-cache-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/products',
  '/api/categories',
  '/api/settings',
  '/api/timer',
  '/api/products/best-selling'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_RESOURCES.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .then(() => {
        console.log('Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Route requests to appropriate cache strategy
  if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is for static resources
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/static/') || 
         url.pathname === '/' ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.html') ||
         url.pathname.includes('manifest.json') ||
         url.pathname.includes('favicon.ico');
}

// Check if request is for API
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         CACHEABLE_APIS.some(api => url.pathname.includes(api));
}

// Check if request is for images
function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) ||
         request.destination === 'image';
}

// Handle static resources with Cache First strategy
async function handleStaticResource(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving static resource from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('Fetching static resource from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error handling static resource:', error);
    return new Response('Static resource not available', { status: 503 });
  }
}

// Handle API requests with Stale While Revalidate strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache auth-related or user-specific APIs
  if (isUserSpecificApi(url.pathname)) {
    return fetch(request);
  }
  
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Start network request regardless of cache status
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        // Only cache successful responses
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch((error) => {
      console.warn('Network request failed for API:', request.url, error);
      throw error;
    });
    
    // If we have cached data, return it immediately and update in background
    if (cachedResponse) {
      console.log('Serving API from cache (stale-while-revalidate):', request.url);
      networkPromise.catch(() => {}); // Ignore network errors when serving from cache
      return cachedResponse;
    }
    
    // No cached data, wait for network
    console.log('Fetching API from network:', request.url);
    return await networkPromise;
    
  } catch (error) {
    console.error('Error handling API request:', error);
    
    // Try to serve from cache as fallback
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving stale API data as fallback:', request.url);
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ error: 'API not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle image requests with Cache First strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Serving image from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('Fetching image from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Only cache images smaller than 5MB
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 5 * 1024 * 1024) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Error handling image request:', error);
    
    // Return placeholder image for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image not available</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Handle other requests with Network First strategy
async function handleOtherRequest(request) {
  try {
    console.log('Fetching other resource from network:', request.url);
    return await fetch(request);
  } catch (error) {
    console.error('Error handling other request:', error);
    return new Response('Resource not available', { status: 503 });
  }
}

// Check if API is user-specific and shouldn't be cached
function isUserSpecificApi(pathname) {
  const userSpecificPatterns = [
    '/api/users/',
    '/api/orders/my-orders',
    '/api/users/profile',
    '/api/users/wishlist',
    '/api/users/addresses',
    '/login',
    '/logout',
    '/register'
  ];
  
  return userSpecificPatterns.some(pattern => pathname.includes(pattern));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCartData());
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get pending cart actions from IndexedDB or localStorage
    const pendingActions = await getPendingCartActions();
    
    for (const action of pendingActions) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        
        // Remove successful action
        await removePendingCartAction(action.id);
      } catch (error) {
        console.error('Failed to sync cart action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for cart sync (simplified)
async function getPendingCartActions() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function removePendingCartAction(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing pending cart action:', actionId);
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Spotlylb', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Cache size management
async function manageCacheSize(cacheName, maxSize = 50) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`Cache ${cacheName} cleaned up: removed ${keysToDelete.length} items`);
  }
}

// Periodic cache cleanup
setInterval(async () => {
  await manageCacheSize(API_CACHE_NAME, 100);
  await manageCacheSize(IMAGE_CACHE_NAME, 200);
}, 30 * 60 * 1000); // Every 30 minutes

console.log('Service Worker loaded successfully');
