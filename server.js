// ===============================
// NFC READER LAPTOP SERVER
// With PWA Support & Advanced Features
// ===============================

const express = require('express');
const open = require('open');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// ===============================
// PWA HEADERS MIDDLEWARE
// ===============================
app.use((req, res, next) => {
    // Disable caching for HTML files (service worker handles it)
    if (req.url.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Service Worker headers
    if (req.url === '/sw.js') {
        res.setHeader('Cache-Control', 'no-cache, max-age=0');
        res.setHeader('Content-Type', 'application/javascript');
    }
    
    // Manifest headers
    if (req.url === '/manifest.json') {
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    
    next();
});

// ===============================
// ROUTE: Receive NFC Data
// ===============================
app.get('/scan', (req, res) => {
    const data = req.query.data;

    if (!data) {
        console.log("❌ No data received");
        return res.status(400).send("No data provided");
    }

    console.log("✅ Received NFC Data:", data);

    // Build URL to patient page with patient ID
    const url = `http://localhost:${PORT}/patient.html?nfc=${encodeURIComponent(data)}`;

    console.log("🌐 Opening:", url);

    // Open browser automatically
    open(url).catch(err => console.log("Browser open error:", err));

    res.json({
        success: true,
        message: "Opening patient page",
        patientId: data
    });
});

// ===============================
// ROUTE: Check server status
// ===============================
app.get('/status', (req, res) => {
    res.json({
        status: "NFC Server Running",
        port: PORT,
        timestamp: new Date().toISOString(),
        pwa: {
            enabled: true,
            serviceWorker: '/sw.js',
            manifest: '/manifest.json'
        }
    });
});

// ===============================
// ROUTE: PWA API - Cache Status
// ===============================
app.get('/api/cache-status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Cache system is operational',
        timestamp: new Date().toISOString()
    });
});

// ===============================
// ROUTE: PWA API - Background Sync
// ===============================
app.post('/api/sync', (req, res) => {
    const { type, data } = req.body;
    
    console.log(`🔄 Sync request for: ${type}`);
    
    res.json({
        status: 'synced',
        type: type,
        timestamp: new Date().toISOString()
    });
});

// ===============================
// ROUTE: PWA API - Push Notification Test
// ===============================
app.post('/api/test-notification', (req, res) => {
    const { title, body } = req.body;
    
    console.log(`📢 Test notification: ${title}`);
    
    res.json({
        status: 'notification sent',
        title: title,
        body: body,
        timestamp: new Date().toISOString()
    });
});

// ===============================
// ROUTE: App Share Handler (Web Share API)
// ===============================
app.post('/share', (req, res) => {
    console.log('📤 Share received:', req.body);
    res.json({
        status: 'shared',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

// ===============================
// ROUTE: Serve offline page
// ===============================
app.get('/offline.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'offline.html'));
});

// ===============================
// ERROR HANDLING
// ===============================
app.use((req, res) => {
    console.log(`⚠️ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Not found',
        path: req.url,
        method: req.method
    });
});

// ===============================
// START SERVER
// ===============================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log("\n");
    console.log("╔════════════════════════════════════════╗");
    console.log("║   🔗 NFC READER SERVER STARTED 🔗     ║");
    console.log("╠════════════════════════════════════════╣");
    console.log(`║  Server: http://localhost:${PORT}        ║`);
    console.log(`║  Access: http://0.0.0.0:${PORT}             ║`);
    console.log("║                                        ║");
    console.log("║  PWA Enabled:    ✅                    ║");
    console.log("║  Service Worker: /sw.js                ║");
    console.log("║  Manifest:       /manifest.json        ║");
    console.log("║                                        ║");
    console.log("║  Status: http://localhost:3000/status  ║");
    console.log("║  NFC:    http://localhost:3000/scan    ║");
    console.log("║                                        ║");
    console.log("║  Ready to receive NFC data from phone  ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("\n");
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("\n✋ Server shutting down...");
    server.close(() => {
        console.log("✅ Server stopped");
        process.exit(0);
    });
});
