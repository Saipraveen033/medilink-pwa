// ===============================
// MEDILINK PWA HELPER
// Handles service worker registration, offline cache, and PWA features
// ===============================

class MediLinkPWA {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    console.log('🚀 Initializing MediLink PWA');
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => this.handleInstallPrompt(e));
    
    // Listen for app installed
    window.addEventListener('appinstalled', () => this.handleAppInstalled());
    
    // Handle any page visibility changes
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    console.log('✅ PWA initialized');
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker registered:', this.swRegistration);
      
      // Check for updates periodically
      setInterval(() => this.checkForUpdates(), 60000); // Every minute
      
      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.handleServiceWorkerUpdate();
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates() {
    if (!this.swRegistration) return;
    
    try {
      await this.swRegistration.update();
      console.log('🔄 Checked for SW updates');
    } catch (error) {
      console.error('❌ Update check failed:', error);
    }
  }

  /**
   * Handle online status
   */
  handleOnline() {
    console.log('🟢 Back online');
    this.isOnline = true;
    
    // Show notification
    this.showNotification('Back Online', {
      body: 'Your connection has been restored. Syncing data...',
      icon: '/images/icon-192x192.png'
    });
    
    // Trigger background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-medical-records');
        registration.sync.register('sync-appointments');
      });
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-online'));
  }

  /**
   * Handle offline status
   */
  handleOffline() {
    console.log('🔴 Offline');
    this.isOnline = false;
    
    // Show notification
    this.showNotification('You Are Offline', {
      body: 'Some features may be limited. Check your internet connection.',
      icon: '/images/icon-192x192.png'
    });
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  }

  /**
   * Handle install prompt
   */
  handleInstallPrompt(event) {
    console.log('📦 Install prompt available');
    
    // Store the event for later use
    window.installPromptEvent = event;
    
    // Prevent auto-show
    event.preventDefault();
    
    // Show install button (if your UI has one)
    this.showInstallButton();
  }

  /**
   * Handle app installed
   */
  handleAppInstalled() {
    console.log('✅ App installed');
    
    // Clear install prompt
    window.installPromptEvent = null;
    
    // Hide install button
    this.hideInstallButton();
    
    // Show congratulations message
    this.showNotification('MediLink Installed', {
      body: 'You can now use MediLink offline!',
      icon: '/images/icon-192x192.png'
    });
  }

  /**
   * Show install button to user
   */
  showInstallButton() {
    let installButton = document.getElementById('pwa-install-btn');
    
    if (!installButton) {
      installButton = document.createElement('button');
      installButton.id = 'pwa-install-btn';
      installButton.className = 'pwa-install-button';
      installButton.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Install App
      `;
      installButton.addEventListener('click', () => this.installApp());
      
      // Add styles
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
      `;
      
      // Add hover effect
      installButton.addEventListener('mouseover', () => {
        installButton.style.transform = 'translateY(-2px)';
        installButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
      });
      
      installButton.addEventListener('mouseout', () => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
      });
      
      document.body.appendChild(installButton);
    }
    
    installButton.style.display = 'flex';
  }

  /**
   * Hide install button
   */
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  /**
   * Trigger app installation
   */
  async installApp() {
    if (!window.installPromptEvent) {
      console.warn('⚠️ Install prompt not available');
      return;
    }
    
    window.installPromptEvent.prompt();
    const { outcome } = await window.installPromptEvent.userChoice;
    
    console.log(`User response: ${outcome}`);
    
    window.installPromptEvent = null;
  }

  /**
   * Handle service worker updates
   */
  handleServiceWorkerUpdate() {
    console.log('🔄 Service Worker updated');
    
    this.showNotification('Update Available', {
      body: 'MediLink has been updated. Please refresh to see the latest changes.',
      icon: '/images/icon-192x192.png'
    });
  }

  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(data) {
    console.log('📬 Message from SW:', data);
    
    if (data.type === 'CACHE_UPDATED') {
      console.log('✅ Cache updated:', data.cache);
    }
  }

  /**
   * Handle visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('📴 App backgrounded');
    } else {
      console.log('📱 App foregrounded');
      // Check for updates when app comes back
      this.checkForUpdates();
    }
  }

  /**
   * Show desktop notification
   */
  async showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && this.swRegistration) {
        this.swRegistration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNotification(title, options);
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Get cached data
   */
  async getCachedData(key) {
    if (!('caches' in window)) return null;
    
    const cache = await caches.open('medilink-api-v1.0.0');
    const response = await cache.match(key);
    return response ? response.json() : null;
  }

  /**
   * Store offline action for sync
   */
  async storeOfflineAction(type, action) {
    if (!('indexedDB' in window)) {
      console.warn('⚠️ IndexedDB not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MediLinkDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        
        const data = {
          id: Date.now().toString(),
          type,
          action,
          timestamp: new Date().toISOString()
        };
        
        const addRequest = store.add(data);
        addRequest.onerror = () => reject(addRequest.error);
        addRequest.onsuccess = () => resolve(data.id);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Get online status
   */
  isAppOnline() {
    return this.isOnline;
  }

  /**
   * Get app version
   */
  getVersion() {
    return '1.0.0';
  }
}

// Initialize PWA on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mediLinkPWA = new MediLinkPWA();
  });
} else {
  window.mediLinkPWA = new MediLinkPWA();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediLinkPWA;
}
