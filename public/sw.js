const CACHE_NAME = 'ci-www-v1';
const STATIC_CACHE = 'ci-static-v1';
const DYNAMIC_CACHE = 'ci-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/webtest/',
  '/webtest/index.html',
  '/webtest/logo.png',
  '/webtest/ci-logo.png',
  '/webtest/hero-gradient-2eb61d.png',
  '/webtest/cloud1.svg',
  '/webtest/cloud2.svg',
  '/webtest/cloud3.svg'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Images - Cache first, fallback to network
  images: /\.(png|jpg|jpeg|webp|svg|gif)$/,
  // Fonts - Cache first
  fonts: /\.(woff|woff2|ttf|eot)$/,
  // CSS/JS - Network first, fallback to cache
  assets: /\.(css|js)$/,
  // API calls - Network first
  api: /\/api\//
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
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
  
  // Skip cross-origin requests (except fonts and known CDNs)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: Images - Cache first
    if (CACHE_STRATEGIES.images.test(pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Fonts - Cache first
    if (CACHE_STRATEGIES.fonts.test(pathname) || url.hostname.includes('fonts.gstatic.com')) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 3: CSS/JS - Stale while revalidate
    if (CACHE_STRATEGIES.assets.test(pathname)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: HTML pages - Network first
    if (request.headers.get('accept')?.includes('text/html')) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Default: Network first
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    
    // Fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const cachedResponse = await caches.match('/webtest/');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// Push notification handler (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
});