# Android NFC Reader App - Complete Setup Guide

## 📋 Prerequisites

- **Android Studio** (Latest version) - Download from [developer.android.com](https://developer.android.com/studio)
- **Android Device** with NFC capability OR Android Emulator with NFC support
- **USB Cable** (if using physical device)
- **Computer** with 8GB+ RAM recommended
- **Java JDK** (Usually included with Android Studio)

---

## 🛠️ Step 1: Create New Project in Android Studio

### 1.1 Open Android Studio and create new project:

1. Click **File** → **New** → **New Project**
2. Select **Empty Activity**
3. Click **Next**

### 1.2 Configure Project:

Fill in the following fields:

```
Name:                  NFCReader
Package name:          com.example.nfcreader
Save location:         (Choose your preferred location)
Source language:       Kotlin  ⭐ IMPORTANT
Minimum SDK:           Android 7.0 (API 24)
Target SDK:            Android 13+ (API 33+)
```

4. Click **Finish**
5. Wait for Gradle to build (this may take 2-3 minutes)

---

## 🔐 Step 2: Update AndroidManifest.xml

### 2.1 Locate the file:

```
Project → app → src → main → AndroidManifest.xml
```

### 2.2 Replace entire content with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.nfcreader">

    <!-- ===== PERMISSIONS ===== -->
    
    <!-- Required for NFC reading -->
    <uses-permission android:name="android.permission.NFC" />
    
    <!-- Required to send HTTP requests to laptop -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- ===== FEATURES ===== -->
    <!-- Requires NFC hardware (can set to false for testing) -->
    <uses-feature
        android:name="android.hardware.nfc"
        android:required="true" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NFCReader"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- NFC Intent Filter -->
            <intent-filter>
                <action android:name="android.nfc.action.NDEF_DISCOVERED" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
            
            <intent-filter>
                <action android:name="android.nfc.action.TAG_DISCOVERED" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

## 📝 Step 3: Create MainActivity.kt

### 3.1 Locate the file:

```
Project → app → src → main → java → com/example/nfcreader → MainActivity.kt
```

### 3.2 Replace entire content with:

```kotlin
package com.example.nfcreader

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Build
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {

    private var nfcAdapter: NfcAdapter? = null
    private lateinit var statusTextView: TextView
    
    // ⚠️ ⚠️ ⚠️ IMPORTANT: Update these values ⚠️ ⚠️ ⚠️
    // Replace with your laptop's IP address
    private val LAPTOP_IP = "192.168.1.100"  // ← CHANGE THIS
    // Keep port as 3000 (unless you changed it in server.js)
    private val SERVER_PORT = "3000"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create UI
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            setPadding(32, 32, 32, 32)
            setBackgroundColor(0xFFFAFAFA.toInt())
        }

        // Title
        val titleText = TextView(this).apply {
            text = "📱 NFC Reader"
            textSize = 32f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setTextColor(0xFF059669.toInt())
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 24 }
        }

        // Subtitle
        val subtitleText = TextView(this).apply {
            text = "Tap your NFC card on the reader"
            textSize = 18f
            setTextColor(0xFF666666.toInt())
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 24 }
        }

        // Status display
        statusTextView = TextView(this).apply {
            text = "⏳ Initializing..."
            textSize = 14f
            setTextColor(0xFF999999.toInt())
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        layout.addView(titleText)
        layout.addView(subtitleText)
        layout.addView(statusTextView)
        setContentView(layout)

        // Initialize NFC
        initializeNFC()
    }

    private fun initializeNFC() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        
        if (nfcAdapter == null) {
            statusTextView.text = "❌ This device does not have NFC"
            statusTextView.setTextColor(0xFFDC2626.toInt())
            Toast.makeText(this, "NFC not available", Toast.LENGTH_LONG).show()
            return
        }

        if (!nfcAdapter!!.isEnabled) {
            statusTextView.text = "⚠️ NFC is disabled. Please enable it in settings."
            statusTextView.setTextColor(0xFFF59E0B.toInt())
        } else {
            statusTextView.text = "✅ Ready to scan. Tap your NFC card..."
            statusTextView.setTextColor(0xFF059669.toInt())
        }

        Toast.makeText(this, "NFC Reader Ready", Toast.LENGTH_SHORT).show()
    }

    override fun onResume() {
        super.onResume()
        
        if (nfcAdapter == null) return

        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)
        
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNfcIntent(intent)
    }

    private fun handleNfcIntent(intent: Intent) {
        val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        
        if (tag == null) {
            statusTextView.text = "❌ No NFC tag detected"
            statusTextView.setTextColor(0xFFDC2626.toInt())
            return
        }

        val ndef = Ndef.get(tag)

        try {
            ndef?.connect()
            val message = ndef?.ndefMessage
            val records = message?.records

            if (records != null && records.isNotEmpty()) {
                // Get payload from first record
                val payload = records[0].payload
                // Remove header bytes and decode
                val rawText = String(payload, Charsets.UTF_8)
                val text = rawText.trim().removePrefix("\u0003").trim()

                if (text.isNotEmpty()) {
                    statusTextView.text = "📡 Sending: '$text'..."
                    statusTextView.setTextColor(0xFF2563EB.toInt())
                    sendToLaptop(text)
                } else {
                    statusTextView.text = "❌ NFC tag is empty"
                    statusTextView.setTextColor(0xFFDC2626.toInt())
                }
            } else {
                statusTextView.text = "❌ No data in NFC tag"
                statusTextView.setTextColor(0xFFDC2626.toInt())
            }

            ndef?.close()
        } catch (e: Exception) {
            e.printStackTrace()
            statusTextView.text = "❌ Error: ${e.message}"
            statusTextView.setTextColor(0xFFDC2626.toInt())
            Toast.makeText(this, "Error reading NFC: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun sendToLaptop(data: String) {
        Thread {
            try {
                // Build URL
                val encodedData = URLEncoder.encode(data, "UTF-8")
                val urlString = "http://$LAPTOP_IP:$SERVER_PORT/scan?data=$encodedData"
                
                val url = URL(urlString)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.connectTimeout = 5000
                conn.readTimeout = 5000
                
                val responseCode = conn.responseCode
                conn.disconnect()

                runOnUiThread {
                    if (responseCode == 200) {
                        statusTextView.text = "✅ Success! Browser opening..."
                        statusTextView.setTextColor(0xFF059669.toInt())
                        Toast.makeText(
                            this,
                            "✅ Data sent to laptop!",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        statusTextView.text = "❌ Server error: $responseCode"
                        statusTextView.setTextColor(0xFFDC2626.toInt())
                        Toast.makeText(
                            this,
                            "Server error: $responseCode",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    statusTextView.text = "❌ Cannot reach server"
                    statusTextView.setTextColor(0xFFDC2626.toInt())
                    Toast.makeText(
                        this,
                        "Error: ${e.message}\nServer not running or wrong IP?",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }.start()
    }
}
```

---

## 🎨 Step 4: Create activity_main.xml (Optional - for better UI)

### 4.1 Locate/Create file:

```
Project → app → src → main → res → layout → activity_main.xml
```

### 4.2 Replace content with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="32dp"
    android:background="#FAFAFA">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="📱 NFC Reader"
        android:textSize="32sp"
        android:textStyle="bold"
        android:textColor="#059669"
        android:layout_marginBottom="24dp"
        android:gravity="center" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Tap your NFC card on the reader"
        android:textSize="18sp"
        android:textColor="#666666"
        android:layout_marginBottom="24dp"
        android:gravity="center" />

    <TextView
        android:id="@+id/statusText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="⏳ Initializing..."
        android:textSize="14sp"
        android:textColor="#999999"
        android:gravity="center" />

</LinearLayout>
```

---

## ⚙️ Step 5: Configure Laptop IP Address

### ⚠️ CRITICAL STEP - Do NOT skip this!

Before running the app, you must update the `LAPTOP_IP` variable in **MainActivity.kt**:

### 5.1 Find your laptop IP:

**On Windows (PowerShell):**
```powershell
ipconfig
```

Look for "IPv4 Address" - usually `192.168.x.x`

**On Mac/Linux:**
```bash
ifconfig
```

Look for the IP address of your WiFi connection

### 5.2 Update MainActivity.kt:

```kotlin
// OLD:
private val LAPTOP_IP = "192.168.1.100"

// NEW (example):
private val LAPTOP_IP = "192.168.0.5"  // ← Your actual IP
```

### 5.3 Make sure both devices are on SAME WiFi network!

---

## 🚀 Step 6: Run the App

### 6.1 Connect device or open Emulator:

**Physical Device:**
- Connect Android phone via USB
- Enable "USB Debugging" in Developer Options
- Click **Allow** on the phone when prompted

**Android Emulator:**
- Create a virtual device with API 30+
- Start the emulator

### 6.2 Run the app:

1. Click the **Run** button (green play icon) in Android Studio
2. Select your device/emulator
3. Click **OK**

### 6.3 Test on device:

1. Make sure Node.js server is running on laptop (`node server.js`)
2. Hold an **NFC card** or tag near the phone's NFC reader
3. The app should:
   - Detect the card
   - Read the patient ID
   - Send it to your laptop
   - Laptop browser should automatically open with the patient page

---

## 🧪 Troubleshooting

### "Cannot reach server" error

**Problem**: Phone can't connect to laptop IP

**Solutions:**
1. Verify laptop IP is correct (run `ipconfig` again)
2. Check both devices are on same WiFi network
3. Try disabling firewall temporarily
4. Ensure server is actually running: `node server.js`
5. Test from laptop browser: `http://localhost:3000/status`

### "No NFC detected"

**Problem**: App doesn't detect NFC tags

**Solutions:**
1. Check phone has NFC hardware (settings → about → specs)
2. Enable NFC in phone settings
3. Make sure card is NDEF-formatted
4. Try different NFC cards
5. Hold card at different angles (back, side, etc.)

### "Compiled with wrong API level"

**Problem**: Gradle compilation error

**Solution:**
- In Android Studio: **File** → **Project Structure**
- Set **Compile SDK Version** to 33 or higher
- Set **Target SDK Version** to 33 or higher

### App crashes on startup

**Problem**: App force closes

**Solutions:**
1. Check logcat (bottom panel in Android Studio)
2. Check internet permission is in AndroidManifest.xml
3. Ensure MainActivity.kt has no syntax errors
4. Try rebuilding project: **Build** → **Rebuild Project**

---

## 📊 Package Structure

Your final project should look like:

```
NFCReader/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/nfcreader/
│   │       │   └── MainActivity.kt        ✅ Updated
│   │       ├── res/
│   │       │   └── layout/
│   │       │       └── activity_main.xml  ✅ Updated
│   │       └── AndroidManifest.xml        ✅ Updated
│   ├── build.gradle
│   └── ...
├── build.gradle
├── settings.gradle
└── ...
```

---

## 🔄 How It Works (Summary)

1. **Device reads NFC** → Patient ID (e.g., "PATIENT123")
2. **App sends HTTP** → `http://laptop_ip:3000/scan?data=PATIENT123`
3. **Server receives** → Extracts patient ID
4. **Opens browser** → `http://localhost:3000/patient.html?nfc=PATIENT123`
5. **Patient page loads** → Shows patient details

---

## 🆘 Need Help?

- Check Android Studio **Logcat** (bottom panel) for error messages
- Enable **USB Debugging** on phone if using physical device
- Verify both phone and laptop are on same WiFi
- Make sure server is running: `node server.js`
- Test server manually: Open browser, go to `http://localhost:3000/status`

---

## ✅ Verification Checklist

Before running the app:

- [ ] AndroidManifest.xml has NFC permissions
- [ ] MainActivity.kt has correct laptop IP
- [ ] Both devices on same WiFi network
- [ ] Node.js server running on laptop
- [ ] Gradle build completes without errors
- [ ] Android Emulator or physical device ready
- [ ] NFC card/tag is NDEF formatted

Good luck! 🚀
