# 🔗 NFC READER SYSTEM - SETUP GUIDE

## Overview
This system allows your Android phone (with NFC) to scan NFC cards/tags and automatically open the patient record on your laptop.

**FLOW**: `NFC Card → Android Phone → HTTP Request → Laptop Server → Browser Opens Patient Page`

---

## 📋 Prerequisites

1. **Android Phone** - Must have NFC capability
2. **Laptop** - Windows/Mac/Linux
3. **WiFi Network** - Both devices on same network
4. **Node.js** - Installed on laptop
5. **Browser** - Chrome, Firefox, Edge (latest)

---

## 🖥️ PART 1: Setup Laptop Server

### Step 1: Install Node.js Dependencies

Navigate to your project folder and run:

```bash
cd medilink-main
npm init -y
npm install express open cors
```

### Step 2: Start the Server

```bash
node server.js
```

You should see:
```
╔════════════════════════════════════════╗
║   🔗 NFC READER SERVER STARTED 🔗     ║
╠════════════════════════════════════════╣
║  Server: http://localhost:3000        ║
║  Status: http://localhost:3000/status ║
║  Ready to receive NFC data from phone  ║
╚════════════════════════════════════════╝
```

### Step 3: Get Your Laptop IP Address

**On Windows (PowerShell):**
```bash
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x)

**On Mac/Linux:**
```bash
ifconfig
```

**Example IP**: `192.168.1.100`

---

## 📱 PART 2: Setup Android App

### Step 1: Create Project in Android Studio

1. Open Android Studio
2. Create new project: **File → New → New Project**
3. Select **Empty Activity**
4. Name: `NFCReader`
5. Package: `com.example.nfcreader`
6. Language: **Kotlin**
7. Click **Finish**

### Step 2: Update AndroidManifest.xml

Add these permissions:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- NFC Permissions -->
    <uses-permission android:name="android.permission.NFC" />
    <uses-feature android:name="android.hardware.nfc" android:required="true" />
    
    <!-- Internet Permission (to send HTTP requests) -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application>
        <!-- Your activities here -->
    </application>

</manifest>
```

### Step 3: Replace MainActivity.kt

Replace the content with:

```kotlin
package com.example.nfcreader

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private var nfcAdapter: NfcAdapter? = null
    
    // ⚠️ CHANGE THIS TO YOUR LAPTOP IP ADDRESS
    private val LAPTOP_IP = "192.168.1.100"
    private val SERVER_PORT = "3000"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        
        if (nfcAdapter == null) {
            Toast.makeText(this, "This device does not have NFC", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
    }

    override fun onResume() {
        super.onResume()
        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNfcIntent(intent)
    }

    private fun handleNfcIntent(intent: Intent) {
        val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        
        if (tag == null) {
            Toast.makeText(this, "No NFC tag detected", Toast.LENGTH_SHORT).show()
            return
        }

        val ndef = Ndef.get(tag)

        try {
            ndef?.connect()
            val message = ndef?.ndefMessage
            val records = message?.records

            if (records != null && records.isNotEmpty()) {
                val payload = records[0].payload
                val text = String(payload, Charsets.UTF_8)
                    .trim()
                    .removePrefix("\u0003") // Remove header byte

                sendToLaptop(text)
            } else {
                Toast.makeText(this, "No data in NFC tag", Toast.LENGTH_SHORT).show()
            }

            ndef?.close()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error reading NFC: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun sendToLaptop(data: String) {
        Thread {
            try {
                val url = URL("http://$LAPTOP_IP:$SERVER_PORT/scan?data=${data}")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.connectTimeout = 5000
                conn.readTimeout = 5000
                
                val responseCode = conn.responseCode
                conn.disconnect()

                runOnUiThread {
                    if (responseCode == 200) {
                        Toast.makeText(this, "✅ Data sent! Laptop opening page...", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "❌ Server error: $responseCode", Toast.LENGTH_SHORT).show()
                    }
                }

            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this, "❌ Cannot reach server: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }
}
```

### Step 4: Create/Update activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="📱 NFC Reader"
        android:textSize="32sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="24dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Tap your card on the NFC reader"
        android:textSize="18sp"
        android:gravity="center"
        android:layout_marginBottom="16dp" />

    <TextView
        android:id="@+id/statusText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Ready to scan..."
        android:textSize="14sp"
        android:textColor="@android:color/darker_gray"
        android:gravity="center" />

</LinearLayout>
```

### Step 5: Configure Server IP

**IMPORTANT**: Before running the app, update the `LAPTOP_IP` variable in MainActivity.kt:

```kotlin
private val LAPTOP_IP = "YOUR_LAPTOP_IP_HERE"  // e.g., "192.168.1.100"
```

### Step 6: Run the Android App

1. Connect Android device via USB or use Android Emulator
2. Click **Run** (green play button)
3. Hold an NFC card/tag near the phone's NFC reader

---

## 🧪 Testing

### Test 1: Check Server is Running

Open browser and go to:
```
http://localhost:3000/status
```

Should return:
```json
{
  "status": "NFC Server Running",
  "port": 3000,
  "timestamp": "2025-03-31T10:30:00.000Z"
}
```

### Test 2: Manual Test (Desktop)

Open this URL in your browser:
```
http://localhost:3000/scan?data=PATIENT12345
```

The patient page should open with ID **PATIENT12345**

### Test 3: From Android Phone

1. Make sure phone is on same WiFi as laptop
2. Ensure server is running
3. Tap NFC card on phone
4. Check laptop - browser should open automatically

---

## 🔧 Troubleshooting

### 1. "Cannot reach server" on Android

**Problem**: Phone can't connect to laptop
- [ ] Check both are on same WiFi
- [ ] Verify laptop IP is correct
- [ ] Check Windows Firewall allows port 3000

**Fix**: Run in PowerShell:
```bash
netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=tcp localport=3000
```

### 2. "No NFC detected"

- [ ] Phone must have NFC hardware
- [ ] NFC must be enabled in phone settings
- [ ] Card must be NDEF formatted

### 3. Patient page doesn't load

- [ ] Check server is running
- [ ] Verify patient.html is in project root
- [ ] Check browser console for errors (F12)

### 4. Can't connect from phone but desktop works

- [ ] Laptop IP might be wrong - run `ipconfig` again
- [ ] Try connecting to `192.168.x.x` instead of `localhost`
- [ ] Disable VPN/Proxy on phone

---

## 📊 File Structure

```
medilink-main/
├── server.js           (← Node.js server)
├── index.html
├── patient.html        (← Shows NFC patient data)
├── doctor.html
├── hospital.html
├── profile.html
├── package.json
├── package-lock.json
├── css/
│   └── style.css
└── js/
    ├── auth.js
    └── supabase-config.js
```

---

## 🚀 How It Works

1. **Phone scans NFC card** → reads patient ID
2. **Android app sends HTTP request** → `http://laptop_ip:3000/scan?data=PATIENT123`
3. **Node.js server receives** → extracts patient ID
4. **Server opens browser** → `http://localhost:3000/patient.html?nfc=PATIENT123`
5. **Patient page loads** → displays patient dashboard

---

## 📝 Next Steps (Optional Enhancements)

- [ ] Add database integration (MySQL/Supabase)
- [ ] Add authentication/authorization
- [ ] Use HTTPS for production
- [ ] Add real-time updates with WebSocket
- [ ] Store NFC scan history
- [ ] Add patient search/manual entry fallback

---

**Questions?** Check browser console (F12) and server logs for errors.
