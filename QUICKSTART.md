# 🔗 MEDILINK NFC SYSTEM - QUICK START GUIDE

## 🎯 Overview

This guide will help you set up the complete NFC reader system that connects your Android phone to your laptop and automatically loads patient records.

**SYSTEM FLOW:**
```
Phone (NFC Reader) → Scan Card → Android App
         ↓
HTTP Request to Laptop
         ↓
Node.js Server (Running on Laptop)
         ↓
Opens Browser with Patient Page
         ↓
Patient Dashboard Displays
```

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Install Server Dependencies (Laptop)

Open PowerShell/Terminal in your project directory:

```bash
cd medilink-main
npm install
```

### 2️⃣ Start the Server (Laptop)

**On Windows:**
```bash
START-SERVER.bat
```

**On Mac/Linux:**
```bash
bash start-server.sh
```

**Or manually:**
```bash
node server.js
```

You should see:
```
╔════════════════════════════════════════╗
║   🔗 NFC READER SERVER STARTED 🔗     ║
╠════════════════════════════════════════╣
║  Server: http://localhost:3000        ║
║  Ready to receive NFC data from phone  ║
╚════════════════════════════════════════╝
```

### 3️⃣ Test Server (Laptop)

Open browser and visit:
- Status Check: `http://localhost:3000/status`
- NFC Tester: `http://localhost:3000/nfc-tester.html`

### 4️⃣ Setup Android App

Follow detailed guide: [ANDROID-SETUP.md](ANDROID-SETUP.md)

**Key steps:**
1. Create new project in Android Studio
2. Update `AndroidManifest.xml` (add NFC permissions)
3. Replace `MainActivity.kt` with provided code
4. **Update laptop IP** in MainActivity.kt
5. Run on device/emulator

### 5️⃣ Test NFC Workflow

1. Keep server running on laptop
2. Tap NFC card on phone
3. Check laptop - browser should open automatically
4. Patient page displays

---

## 📂 File Structure

```
medilink-main/
├── 📄 server.js                    ← Node.js server (listens on port 3000)
├── 📄 patient.html                 ← Patient dashboard (NFC enabled)
├── 📄 package.json                 ← Dependencies
├── 📄 nfc-tester.html              ← Test interface
├── 📄 NFC-SETUP.md                 ← Detailed NFC setup
├── 📄 ANDROID-SETUP.md             ← Android app development guide
├── 🚀 START-SERVER.bat             ← Windows startup script
├── 🚀 start-server.sh              ← macOS/Linux startup script
├── 📁 css/
│   └── style.css
├── 📁 js/
│   ├── auth.js
│   └── supabase-config.js
├── 📑 index.html
├── 📑 doctor.html
├── 📑 hospital.html
└── 📑 profile.html
```

---

## 🔧 Detailed Setup Guides

### Laptop Setup
📖 See: [NFC-SETUP.md](NFC-SETUP.md)

### Android App Setup
📖 See: [ANDROID-SETUP.md](ANDROID-SETUP.md)

---

## 🧪 Testing Without NFC Hardware

### Test Using Desktop Browser

Visit the NFC tester page:
```
http://localhost:3000/nfc-tester.html
```

You can:
1. Check server status
2. Simulate NFC scans
3. View detailed logs
4. Run automated tests

### Manual Test URL

Open in browser:
```
http://localhost:3000/scan?data=TEST12345
```

This simulates NFC data and should:
- Open patient page automatically
- Display patient ID: TEST12345

---

## 🌐 Network Configuration

### Find Your Laptop IP

**Windows (PowerShell):**
```powershell
ipconfig
```
Look for: `IPv4 Address: 192.168.x.x`

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
hostname -I
```

### Update Android App

In `MainActivity.kt`, find:
```kotlin
private val LAPTOP_IP = "192.168.1.100"  // ← Change this
```

Replace with your actual IP address.

---

## 📱 Android Device Setup

### Enable NFC & USB Debugging

1. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging (ON)
   
2. **Enable NFC:**
   - Settings → NFC → Turn ON

3. **WiFi:**
   - Connect to same WiFi as laptop

---

## ✅ Pre-Flight Checklist

Before going live:

- [ ] Node.js installed on laptop
- [ ] Server runs without errors: `node server.js`
- [ ] NFC tester page loads: `http://localhost:3000/nfc-tester.html`
- [ ] Android app compiles in Android Studio
- [ ] Laptop IP is correct in MainActivity.kt
- [ ] Phone & laptop on same WiFi
- [ ] NFC is enabled on phone
- [ ] Server is running when testing

---

## 🚨 Troubleshooting

### Problem: "Cannot reach server" on Android

**Check:**
1. Is server running? (`node server.js`)
2. Is laptop IP correct? (run `ipconfig`)
3. Are both on same WiFi?
4. Is Windows Firewall blocking? (port 3000)

**Fix Firewall (Windows):**
```powershell
netsh advfirewall firewall add rule name="NodeServer" dir=in action=allow protocol=tcp localport=3000
```

### Problem: Patient page doesn't load

**Check:**
1. Browser console (F12) for errors
2. Server logs - any errors?
3. Is patient.html in correct location?

**Test manually:**
```
http://localhost:3000/scan?data=PATIENT001
```

### Problem: NFC doesn't detect card

**Check:**
1. Is NFC enabled on phone?
2. Is card NDEF-formatted?
3. Try different card angles
4. Try different cards
5. Check phone has NFC hardware

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────┐
│  Android Phone (NFC Reader)     │
│  ┌────────────────────────────┐ │
│  │   MainActivity.kt           │ │
│  │   - Reads NFC data          │ │
│  │   - Sends HTTP request      │ │
│  └────────────────────────────┘ │
└────────────┬────────────────────┘
             │
             │ HTTP GET
             │ /scan?data=PATIENT123
             │
             ↓
┌─────────────────────────────────┐
│  Laptop Server (Node.js)        │
│  ┌────────────────────────────┐ │
│  │   server.js (Port 3000)     │ │
│  │   - Receives HTTP request   │ │
│  │   - Extracts patient ID     │ │
│  │   - Opens browser           │ │
│  └────────────────────────────┘ │
└────────────┬────────────────────┘
             │
             │ Opens URL
             │ patient.html?nfc=PATIENT123
             │
             ↓
┌─────────────────────────────────┐
│  Browser (Chrome/Firefox)       │
│  ┌────────────────────────────┐ │
│  │   patient.html              │ │
│  │   - Loads patient dashboard │ │
│  │   - Shows patient data      │ │
│  │   - Displays NFC badge      │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🔐 Security Considerations

For production use:

- [ ] Use HTTPS instead of HTTP
- [ ] Add authentication/authorization
- [ ] Validate patient IDs before loading
- [ ] Log all NFC scans for audit trail
- [ ] Encrypt sensitive patient data
- [ ] Implement rate limiting on /scan endpoint
- [ ] Use VPN for remote connections
- [ ] Add CORS protection

---

## 📈 Next Steps

After basic setup works:

1. **Add Database Integration**
   - Store patient records in Supabase/MySQL
   - Link NFC scans to patient profiles

2. **Enhance UI**
   - Add patient photo display
   - Show medical history
   - Display appointment calendar

3. **Add Features**
   - Real-time notifications
   - Doctor notes integration
   - Prescription management
   - Test result uploads

4. **Production Deployment**
   - Use PM2 for process management
   - Setup HTTPS/SSL certificates
   - Deploy to cloud server
   - Setup proper domain name

---

## 📞 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Server won't start | Check Node.js is installed: `node --version` |
| Port already in use | Change port in server.js or kill process using port 3000 |
| Can't find phone IP | Phone Settings → About → IP Address |
| Browser doesn't open | Check `open` package is installed: `npm install open` |
| NFC not working | Enable NFC in phone settings |
| Patient page blank | Check browser console (F12) for JavaScript errors |

### Still Having Issues?

1. Check server logs (terminal window running server.js)
2. Check browser console (F12 in Chrome)
3. Test with NFC tester: `http://localhost:3000/nfc-tester.html`
4. Verify server is running: `http://localhost:3000/status`
5. Check firewall rules (Windows)

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Android NFC Documentation](https://developer.android.com/guide/topics/connectivity/nfc)
- [Express.js Guide](https://expressjs.com/)
- [Kotlin Documentation](https://kotlinlang.org/docs/)

---

## 🎉 You're Ready!

Once setup is complete, your system can:

✅ Read NFC cards/tags from Android phone
✅ Send data to laptop server automatically
✅ Open patient records in browser instantly
✅ Display patient information with NFC badge
✅ Log all NFC scan activities

**Happy scanning! 📱🔗💻**

---

*Last updated: March 31, 2026*
*MediLink NFC Reader System v1.0*
