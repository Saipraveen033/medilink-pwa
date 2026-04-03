// ===============================
// PWA CACHE STRATEGY CONFIGURATION
// Fine-tune caching behavior for different content types
// ===============================

const CACHE_STRATEGIES = {
  // Static assets - cache first, update in background
  CACHE_FIRST: 'cache-first',
  
  // API calls - network first, fallback to cache
  NETWORK_FIRST: 'network-first',
  
  // Hybrid - try network, fallback to cache with 5m timeout
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

const CACHE_CONFIG = {
  // HTML pages
  pages: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: 'medilink-runtime-v1.0.0',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxItems: 50
  },

  // CSS and JavaScript
  scripts: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'medilink-runtime-v1.0.0',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxItems: 100
  },

  // Images
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: 'medilink-images-v1.0.0',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxItems: 200,
    format: ['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']
  },

  // API calls
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: 'medilink-api-v1.0.0',
    maxAge: 60 * 60 * 1000, // 1 hour
    maxItems: 100,
    timeout: 5000 // 5 second network timeout
  },

  // Supabase/External APIs
  external: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: 'medilink-api-v1.0.0',
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxItems: 50,
    timeout: 8000 // 8 second timeout
  }
};

// ===============================
// URL PATTERNS FOR CATEGORIZATION
// ===============================
const URL_PATTERNS = {
  // Pages
  pages: [
    /\.html$/,
    /\/$/ // root path
  ],

  // Scripts
  scripts: [
    /\.js$/,
    /\.json$/
  ],

  // Styles
  styles: [
    /\.css$/
  ],

  // Images
  images: [
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.webp$/
  ],

  // API endpoints
  api: [
    /^https?:\/\/localhost:3000\/api\/.*/,
    /^https?:\/\/127\.0\.0\.1:3000\/api\/.*/
  ],

  // External APIs
  external: [
    /supabase\.co/,
    /cdn\.jsdelivr\.net/,
    /cdnjs\.cloudflare\.com/
  ]
};

// ===============================
// CACHE CLEANER
// Removes old/excess cached items
// ===============================
class CacheCleaner {
  static async cleanOldCaches() {
    const cacheNames = await caches.keys();
    const now = Date.now();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (!response) continue;

        // Get date from response
        const date = new Date(response.headers.get('date'));
        const age = now - date.getTime();

        // Get max age from config
        const config = this.getConfigForUrl(request.url);
        if (config && age > config.maxAge) {
          console.log(`🗑️ Deleting old cache: ${request.url}`);
          await cache.delete(request);
        }
      }
    }
  }

  static async enforceMaxItems(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    if (requests.length > maxItems) {
      const toDelete = requests.length - maxItems;
      const sorted = requests.sort((a, b) => {
        // Sort by response date (oldest first)
        return new Date(a) - new Date(b);
      });

      for (let i = 0; i < toDelete; i++) {
        console.log(`🗑️ Removing excess cache: ${sorted[i].url}`);
        await cache.delete(sorted[i]);
      }
    }
  }

  static getConfigForUrl(url) {
    if (URL_PATTERNS.api.some(p => p.test(url))) {
      return CACHE_CONFIG.api;
    } else if (URL_PATTERNS.external.some(p => p.test(url))) {
      return CACHE_CONFIG.external;
    } else if (URL_PATTERNS.images.some(p => p.test(url))) {
      return CACHE_CONFIG.images;
    } else if (URL_PATTERNS.scripts.some(p => p.test(url))) {
      return CACHE_CONFIG.scripts;
    } else if (URL_PATTERNS.styles.some(p => p.test(url))) {
      return CACHE_CONFIG.scripts;
    } else if (URL_PATTERNS.pages.some(p => p.test(url))) {
      return CACHE_CONFIG.pages;
    }
    return null;
  }
}

// ===============================
// AUTOMATIC CACHE CLEANUP
// Run periodically to maintain cache size
// ===============================
if (typeof setInterval !== 'undefined') {
  // Clean caches every 6 hours
  setInterval(() => {
    console.log('🧹 Running cache cleanup...');
    CacheCleaner.cleanOldCaches();
  }, 6 * 60 * 60 * 1000);
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_STRATEGIES,
    CACHE_CONFIG,
    URL_PATTERNS,
    CacheCleaner
  };
}
