# MediLink PWA (Progressive Web App) Documentation

## Overview

MediLink has been successfully converted into a **Progressive Web App (PWA)**. This enables users to:
- ✅ Install the app on their desktop/mobile device
- ✅ Work offline with cached medical records
- ✅ Continue work and sync automatically when back online
- ✅ Receive push notifications
- ✅ Access the app from the home screen

---

## What's New

### Files Added

1. **`manifest.json`** - PWA manifest with app metadata, icons, and shortcuts
2. **`sw.js`** - Service Worker handling offline caching and background sync
3. **`js/pwa.js`** - PWA helper library with feature detection and install prompts
4. **`js/cache-config.js`** - Cache strategy configuration for different content types
5. **`offline.html`** - Fallback page shown when offline
6. **`PWA-SETUP.md`** - This documentation file

### Files Modified

All HTML files (`index.html`, `patient.html`, `doctor.html`, `hospital.html`, `hospital-admin.html`, `profile.html`, `nfc-tester.html`) now include:
- PWA meta tags for iOS and Android support
- Link to manifest.json
- PWA initialization script (pwa.js)

---

## Installation & Setup

### 1. Prerequisites

Ensure your project is running under HTTPS (production) or localhost (development). PWA features work on:
- ✅ HTTPS (production)
- ✅ localhost (development)
- ✅ 127.0.0.1 (development)

### 2. Start the Server

```bash
npm install
npm start
```

The server will start at `http://localhost:3000` with PWA enabled.

### 3. Test on Your Device

#### Desktop (Chrome/Edge)
1. Open `http://localhost:3000`
2. Check for install button in browser address bar
3. Click to install MediLink

#### Mobile Device
1. Ensure device is on same network as server
2. Navigate to `http://[SERVER-IP]:3000`
3. Tap "Add to Home Screen" (iPhone) or "Install" (Android)

---

## PWA Features

### 1. **Service Worker** (`sw.js`)

Manages:
- **Caching strategies** for different content types
- **Offline functionality** with fallback pages
- **Background sync** for offline actions
- **Push notifications**

**Cache Strategies:**
- **Cache First**: Static assets (CSS, JS) - use cached version, update in background
- **Network First**: HTML/API - try network first, fallback to cache
- **Stale While Revalidate**: Latest data with fallback to cached version

### 2. **Offline Support**

When offline, users can:
- ✅ View previously cached medical records
- ✅ Browse patient dashboards
- ✅ Queue actions for sync when back online
- ✅ See helpful offline page with cached links

**Offline Page**: `offline.html` - Auto-shown when connection is lost

### 3. **Installation**

Users can install MediLink as:
- **Desktop app** (Windows, macOS, Linux)
- **Mobile app** (iOS, Android)
- **Runs in standalone mode** (like native app, no browser UI)

### 4. **Notifications**

Push notifications support for:
- Appointment reminders
- Medical alerts
- Test results
- System updates

### 5. **Background Sync**

Automatically syncs data when connection is restored:
- Medical records updates
- Appointment changes
- User actions queued while offline

---

## Usage & API

### Auto-Initialization

MediLink PWA initializes automatically on page load via `js/pwa.js`.

```javascript
// Access PWA instance
window.mediLinkPWA
```

### Check Online Status

```javascript
// Check if online/offline
if (window.mediLinkPWA.isAppOnline()) {
  console.log('User is online');
} else {
  console.log('User is offline');
}
```

### Listen for Online/Offline Events

```javascript
// Custom events dispatched by PWA
window.addEventListener('pwa-online', () => {
  console.log('Back online - syncing data');
});

window.addEventListener('pwa-offline', () => {
  console.log('Now offline');
});
```

### Request Notification Permission

```javascript
// Ask user for notification permission
await window.mediLinkPWA.requestNotificationPermission();
```

### Show Notification

```javascript
// Show notification
window.mediLinkPWA.showNotification('Appointment Reminder', {
  body: 'You have an appointment at 2:00 PM',
  icon: '/images/icon-192x192.png'
});
```

### Store Offline Action

```javascript
// Queue action for sync when back online
await window.mediLinkPWA.storeOfflineAction('records', {
  action: 'update',
  data: { /* ... */ }
});
```

### Install App Programmatically

```javascript
// Trigger install prompt
if (window.installPromptEvent) {
  await window.mediLinkPWA.installApp();
}
```

---

## Cache Strategy Details

### Images
- **Strategy**: Cache First
- **Max Age**: 30 days
- **Max Items**: 200
- **Formats**: PNG, JPEG, GIF, SVG, WebP

### CSS & JavaScript
- **Strategy**: Cache First
- **Max Age**: 7 days
- **Max Items**: 100

### HTML Pages
- **Strategy**: Network First
- **Max Age**: 24 hours
- **Max Items**: 50

### API Calls (Local)
- **Strategy**: Network First
- **Timeout**: 5 seconds
- **Max Age**: 1 hour
- **Max Items**: 100

### External APIs (Supabase)
- **Strategy**: Network First
- **Timeout**: 8 seconds
- **Max Age**: 30 minutes
- **Max Items**: 50

---

## Server API Routes

New PWA-specific routes added to `server.js`:

### Cache Status
```
GET /api/cache-status
Response: { status: 'ok', timestamp: '...' }
```

### Background Sync
```
POST /api/sync
Body: { type: 'records|appointments', data: {...} }
Response: { status: 'synced', type: '...', timestamp: '...' }
```

### Test Notification
```
POST /api/test-notification
Body: { title: 'Test', body: 'Test notification' }
Response: { status: 'notification sent', ... }
```

### Web Share
```
POST /share
Body: { title, text, url, files }
Response: { status: 'shared', ... }
```

---

## Debugging & Development

### Enable Logging

Service Worker logs are sent to browser console:
```javascript
// In DevTools Console
navigator.serviceWorker.ready.then(reg => {
  console.log('SW registered:', reg);
});
```

### View Cache Storage

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Application → Cache Storage
3. View cached resources by cache name

### Clear Cache

```javascript
// Clear all caches
await Promise.all(
  (await caches.keys()).map(name => caches.delete(name))
);
```

### Debugging Service Worker

```javascript
// Register SW with logging
navigator.serviceWorker.register('/sw.js').then(reg => {
  console.log('✅ SW registered');
  reg.onupdatefound = () => {
    console.log('🔄 SW update found');
  };
}).catch(err => {
  console.error('❌ SW registration failed:', err);
});
```

---

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ✅      | ⚠️*    |
| Edge    | ✅      | ✅     |

*Safari has limited PWA support. iOS 16.4+ has better support.

---

## Security

### PWA Security Features

1. **HTTPS Enforcement** (production)
   - Service Worker requires HTTPS in production
   - Localhost/127.0.0.1 work for development

2. **Content Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

3. **Offline Data Isolation**
   - Cached data stored in browser's Cache Storage
   - Credentials handled via Supabase authentication
   - No sensitive data stored in plain text

### Recommendations

1. **Always use HTTPS in production**
2. **Implement authentication tokens** for API calls
3. **Validate data** before caching
4. **Clear cache** on logout:
   ```javascript
   async function logout() {
     // ... logout logic ...
     // Clear caches
     const cacheNames = await caches.keys();
     await Promise.all(cacheNames.map(name => caches.delete(name)));
   }
   ```

---

## Testing Offline Functionality

### Desktop Testing

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Navigate around the app
5. Features should work with cached data

### Network Throttling

1. DevTools → Network tab
2. Select throttling speed (Slow 3G, etc.)
3. Test app performance under poor connection

---

## Performance Tips

1. **Minimize bundle size**
   - Tree-shake unused code
   - Use code splitting

2. **Optimize images**
   - Use WebP format with fallback
   - Compress images before caching

3. **Cache wisely**
   - Don't cache too many large files
   - Remove old caches regularly

4. **Monitor cache size**
   - Review `cache-config.js` limits
   - Adjust `maxItems` and `maxAge` as needed

---

## Troubleshooting

### Service Worker Not Registering

**Problem**: SW not showing in DevTools

**Solutions**:
1. Check browser console for errors
2. Verify `sw.js` path is correct
3. Check HTTPS/localhost requirement
4. Clear browser cache and reload

### App Not Installable

**Problem**: No install button appearing

**Solutions**:
1. Verify manifest.json is valid:
   ```bash
   curl http://localhost:3000/manifest.json | jq .
   ```
2. Check all required PWA meta tags are present
3. Ensure icons exist in `/images/` directory
4. Test on Chrome/Edge (best support)

### Cache Issues

**Problem**: Changes not appearing

**Solutions**:
1. Hard refresh (Ctrl+Shift+R)
2. Clean cache in DevTools
3. Check cache strategy in `sw.js`
4. Restart server

### Offline Not Working

**Problem**: App crashes when going offline

**Solutions**:
1. Check Network tab for failed requests
2. Verify `offline.html` exists
3. Check service worker errors in console
4. Test with simulated offline mode

---

## Next Steps

### Enhancement Ideas

1. **Data Sync**
   - Implement encrypted local storage for sensitive data
   - Queue medical record updates for sync

2. **Notifications**
   - Add appointment reminders
   - Medical test result alerts
   - System announcements

3. **Performance**
   - Implement caching for images/PDFs
   - Lazy load components
   - Code splitting for faster loads

4. **Advanced Features**
   - Implement file download capability
   - Medical record export (PDF)
   - Encrypted local backup

### Monitoring

Implement analytics to track:
- Installation rate
- Offline usage
- Cache hit ratio
- Performance metrics
- Error rates

---

## Resources

### Official PWA Documentation
- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google Web - PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Tools & Testing
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web App Manifest Validator](https://manifest-validator.appspot.com/)

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are in place
3. Review service worker status in DevTools
4. Ensure HTTPS (prod) or localhost (dev)

---

**Last Updated**: April 2026
**MediLink Version**: 1.0.0
**PWA Version**: 1.0.0
