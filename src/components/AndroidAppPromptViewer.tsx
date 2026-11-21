import React, { useState } from 'react';
import {
  Copy,
  Check,
  Cpu,
  Code,
  Terminal,
  Smartphone,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Radio,
  Share2,
  QrCode
} from 'lucide-react';

interface AndroidAppPromptViewerProps {
  pairingToken?: string;
  pairingEndpoint?: string;
}

export default function AndroidAppPromptViewer({
  pairingToken = 'HSSMS-SECURE-9821-TK88',
  pairingEndpoint = window.location.origin
}: AndroidAppPromptViewerProps) {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'service' | 'scanner' | 'main' | 'gradle'>('manifest');

  // Master Prompt for Google AI Studio / Cursor / Android Studio
  const MASTER_PROMPT = `
# SYSTEM PROMPT: PRODUCTION-GRADE ANDROID SMS GATEWAY CLIENT (KOTLIN)

You are an expert Android Mobile Architect. Your task is to build a complete, production-grade standalone Android Application in Kotlin (using Jetpack Compose / Material 3) that functions as an autonomous **Hardware SMS Gateway Hub**.

## 🎯 CORE OBJECTIVE & WORKFLOW:
1. **Universal QR Pairing (Multi-Project Ready):**
   - The user opens the app and scans the pairing QR code from any Web Admin Panel / E-commerce portal.
   - The QR code payload JSON format:
     \`\`\`json
     {
       "protocol": "hssms-v1",
       "endpoint": "https://your-domain.com",
       "token": "HSSMS-SECURE-TOKEN",
       "deviceName": "Samsung Galaxy S24"
     }
     \`\`\`
   - Store the active endpoint, token, and device name securely in \`EncryptedSharedPreferences\` or \`DataStore\`.
   - The app must support connecting to multiple projects or switching projects at any time.

2. **Foreground SMS Dispatch Service (Doze-Mode Proof):**
   - Implement a robust Android Foreground Service (\`SmsGatewayService\`) with a persistent ongoing notification ("SMS Gateway is Active & Ready").
   - Request \`android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS\` and acquire \`PARTIAL_WAKE_LOCK\` so the service is NEVER killed by Android OS in sleep/doze mode.
   - Boot-receiver (\`RECEIVE_BOOT_COMPLETED\`) to auto-start the gateway service when the phone restarts.

3. **Dual SIM Card Resolution & Native SmsManager:**
   - Detect all available active SIM subscriptions via \`SubscriptionManager.getActiveSubscriptionInfoList()\`.
   - Read SIM slot 1 (Carrier name, subId) and SIM slot 2.
   - When the web server dispatches an SMS with \`simSlot: 1\` or \`simSlot: 2\`, route through \`SmsManager.getSmsManagerForSubscriptionId(subId)\`.
   - Support long/multipart SMS using \`smsManager.sendMultipartTextMessage\`.
   - Listen for \`SENT_SMS_ACTION\` and \`DELIVERED_SMS_ACTION\` BroadcastReceivers to confirm real telecom network delivery.

4. **Bi-Directional Communication (WebSocket & Auto Long-Polling):**
   - Primary: Connect via WebSocket to \`\${endpoint}/api/gateway/android/ws?token=\${token}\`.
   - Fallback: Long-polling worker executing every 3-5 seconds to \`\${endpoint}/api/gateway/android/poll?token=\${token}\`.
   - Every 30 seconds, send a Telemetry Heartbeat to the server:
     \`\`\`json
     {
       "token": "HSSMS-SECURE-TOKEN",
       "batteryLevel": 85,
       "isCharging": true,
       "networkSignal": "4G LTE",
       "sim1": "Grameenphone",
       "sim2": "Banglalink"
     }
     \`\`\`
   - When an SMS is sent successfully or fails, immediately POST delivery confirmation to:
     \`POST \${endpoint}/api/gateway/android/report\` with \`{ queueId, status: "delivered" | "failed", error, timestamp }\`.

5. **Modern Jetpack Compose UI:**
   - Clean dark/light theme dashboard with:
     * Server Connection Status badge (🟢 Connected / 🔴 Disconnected).
     * Connected Server URL and active Project Name.
     * Dual SIM cards indicator with live network carriers.
     * Real-time Terminal Log window showing outgoing SMS and delivery responses.
     * Start/Stop Gateway toggle button.
     * "Scan New Project QR" button to quickly pair with a different client/project.

---
Generate all necessary Android project files including:
1. \`AndroidManifest.xml\` (with all permissions)
2. \`build.gradle.kts\` (app-level dependencies)
3. \`SmsGatewayService.kt\`
4. \`QRScannerActivity.kt\`
5. \`MainActivity.kt\` (Jetpack Compose UI)
`.trim();

  // Code Snippets
  const CODE_SNIPPETS = {
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.unified.smsgateway">

    <!-- SMS Permissions -->
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
    
    <!-- Camera for QR Pairing -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Background Service & Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Universal SMS Gateway"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SMSGateway"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".QRScannerActivity"
            android:screenOrientation="portrait" />

        <!-- Persistent Background SMS Dispatcher -->
        <service
            android:name=".SmsGatewayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="dataSync" />

        <!-- Auto start on Phone Reboot -->
        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,

    service: `package com.unified.smsgateway

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import okhttp3.*
import org.json.JSONObject

class SmsGatewayService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private var isRunning = false
    private val client = OkHttpClient()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(101, createNotification("SMS Gateway Active & Connected"))
        if (!isRunning) {
            isRunning = true
            startListeningForMessages()
        }
        return START_STICKY
    }

    private fun startListeningForMessages() {
        serviceScope.launch {
            while (isRunning) {
                try {
                    val prefs = getSharedPreferences("gateway_config", Context.MODE_PRIVATE)
                    val endpoint = prefs.getString("endpoint", "") ?: ""
                    val token = prefs.getString("token", "") ?: ""

                    if (endpoint.isNotEmpty() && token.isNotEmpty()) {
                        // Poll server for pending SMS queue
                        val request = Request.Builder()
                            .url("$endpoint/api/gateway/android/poll?token=$token")
                            .build()

                        val response = client.newCall(request).execute()
                        val responseBody = response.body?.string()

                        if (!responseBody.isNullOrEmpty()) {
                            val json = JSONObject(responseBody)
                            if (json.optBoolean("hasQueue", false)) {
                                val queueId = json.getString("queueId")
                                val phone = json.getString("phone")
                                val text = json.getString("message")
                                val simSlot = json.optInt("simSlot", 1)

                                sendSmsViaSim(phone, text, simSlot, queueId, endpoint, token)
                            }
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                delay(3000) // Poll interval
            }
        }
    }

    private fun sendSmsViaSim(
        phone: String, 
        message: String, 
        simSlot: Int, 
        queueId: String,
        endpoint: String,
        token: String
    ) {
        try {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            val subList = subManager.activeSubscriptionInfoList

            val subId = if (!subList.isNullOrEmpty()) {
                val targetIndex = if (simSlot == 2 && subList.size > 1) 1 else 0
                subList[targetIndex].subscriptionId
            } else {
                SubscriptionManager.getDefaultSmsSubscriptionId()
            }

            val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                applicationContext.getSystemService(SmsManager::class.java).createForSubscriptionId(subId)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getSmsManagerForSubscriptionId(subId)
            }

            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(phone, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(phone, null, message, null, null)
            }

            // Report success back to Web Server
            reportStatus(endpoint, token, queueId, "delivered", null)

        } catch (e: Exception) {
            reportStatus(endpoint, token, queueId, "failed", e.message)
        }
    }

    private fun reportStatus(endpoint: String, token: String, queueId: String, status: String, error: String?) {
        serviceScope.launch {
            try {
                val json = JSONObject().apply {
                    put("token", token)
                    put("queueId", queueId)
                    put("status", status)
                    put("error", error ?: "")
                }
                val body = RequestBody.create(MediaType.parse("application/json"), json.toString())
                val request = Request.Builder()
                    .url("$endpoint/api/gateway/android/report")
                    .post(body)
                    .build()
                client.newCall(request).execute()
            } catch (e: Exception) {}
        }
    }

    private fun createNotification(text: String): Notification {
        val channelId = "sms_gateway_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "SMS Gateway Service", NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Universal SMS Gateway")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        isRunning = false
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,

    scanner: `package com.unified.smsgateway

import android.content.Context
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import org.json.JSONObject

class QRScannerActivity : AppCompatActivity() {

    private val barcodeLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents != null) {
            try {
                val json = JSONObject(result.contents)
                val endpoint = json.getString("endpoint")
                val token = json.getString("token")
                val deviceName = json.optString("deviceName", "Android Gateway")

                // Save configuration
                val prefs = getSharedPreferences("gateway_config", Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("endpoint", endpoint)
                    .putString("token", token)
                    .putString("deviceName", deviceName)
                    .apply()

                Toast.makeText(this, "সার্ভার পেয়ারিং সফল হয়েছে!", Toast.LENGTH_LONG).show()
                finish()
            } catch (e: Exception) {
                Toast.makeText(this, "অবৈধ QR কোড ফরম্যাট!", Toast.LENGTH_LONG).show()
            }
        } else {
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val options = ScanOptions().apply {
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            setPrompt("ওয়েব প্যানেলের পেয়ারিং QR কোড স্ক্যান করুন")
            setCameraId(0)
            setBeepEnabled(true)
            setOrientationLocked(true)
        }
        barcodeLauncher.launch(options)
    }
}`,

    main: `package com.unified.smsgateway

import android.Manifest
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request SMS and Phone state permissions
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.SEND_SMS,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.CAMERA
            ),
            1001
        )

        // Request Battery Optimization Exemption (Crucial for background service)
        requestBatteryOptimizationExemption()

        setContent {
            MaterialTheme {
                GatewayDashboard()
            }
        }
    }

    private fun requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            }
        }
    }

    @Composable
    fun GatewayDashboard() {
        val prefs = getSharedPreferences("gateway_config", Context.MODE_PRIVATE)
        var endpoint by remember { mutableStateOf(prefs.getString("endpoint", "সংযুক্ত নয়") ?: "") }
        var isServiceRunning by remember { mutableStateOf(true) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Universal SMS Gateway Hub",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "সংযুক্ত সার্ভার:", color = Color.Gray)
                    Text(text = endpoint, color = Color(0xFF38BDF8))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "গেটওয়ে স্ট্যাটাস: চলমান (Active)", color = Color(0xFF4ADE80))
                }
            }

            Button(
                onClick = {
                    startActivity(Intent(this@MainActivity, QRScannerActivity::class.java))
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("নতুন প্রজেক্ট QR স্ক্যান করুন")
            }

            Button(
                onClick = {
                    val serviceIntent = Intent(this@MainActivity, SmsGatewayService::class.java)
                    if (isServiceRunning) {
                        stopService(serviceIntent)
                        isServiceRunning = false
                    } else {
                        startService(serviceIntent)
                        isServiceRunning = true
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isServiceRunning) Color(0xFFEF4444) else Color(0xFF10B981)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isServiceRunning) "সার্ভিস বন্ধ করুন" else "সার্ভিস চালু করুন")
            }
        }
    }
}`,

    gradle: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.unified.smsgateway"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.unified.smsgateway"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")

    // QR Code Scanner (ZXing Embedded)
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
    implementation("com.google.zxing:core:3.5.3")

    // Networking (OkHttp & Coroutines)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Core AndroidX
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
}`
  };

  const handleCopyMasterPrompt = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2500);
  };

  const handleCopyCode = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-500/30">
                PHASE 2 • UNIVERSAL ANDROID GATEWAY
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Ready for AI Studio & Android Studio
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              অ্যান্ড্রয়েড গেটওয়ে অ্যাপ মাস্টার প্রম্পট ও পূর্ণাঙ্গ সোর্স কোড
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              এই মাস্টার প্রম্পট ও কোডবেস ব্যবহার করে একটি মাত্র অ্যান্ড্রয়েড অ্যাপ বানিয়ে আপনি আপনার যেকোনো ভিন্ন ভিন্ন প্রজেক্টে (ই-কমার্স, ইনভয়েসিং, স্কুল, ফার্মাসি বা কাস্টম প্যানেল) সরাসরি ব্যবহার করতে পারবেন।
            </p>
          </div>

          <button
            onClick={handleCopyMasterPrompt}
            className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all transform active:scale-95 shadow-xl cursor-pointer shrink-0 ${
              copiedMaster
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/30'
            }`}
          >
            {copiedMaster ? (
              <>
                <Check className="w-5 h-5" />
                <span>মাস্টার প্রম্পট কপি হয়েছে! ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>AI Studio Master Prompt কপি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workflow Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
            ১
          </div>
          <h4 className="text-sm font-bold text-slate-900">AI Studio / IDE-তে প্রম্পট পেস্ট</h4>
          <p className="text-xs text-slate-500">
            উপরের প্রম্পটটি কপি করে Google AI Studio বা Android Studio-তে দিয়ে প্রজেক্ট জেনারেট করে APK বিল্ড করুন।
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
            ২
          </div>
          <h4 className="text-sm font-bold text-slate-900">ফোনে APK ইন্সটল ও QR স্ক্যান</h4>
          <p className="text-xs text-slate-500">
            অ্যাপটি ফোনে ওপেন করে "২. অ্যান্ড্রয়েড সিম গেটওয়ে" ট্যাবের QR কোড স্ক্যান করলেই সার্ভারের সাথে পেয়ার হয়ে যাবে।
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
            ৩
          </div>
          <h4 className="text-sm font-bold text-slate-900">সীমাহীন মাল্টি-প্রজেক্ট এসএমএস</h4>
          <p className="text-xs text-slate-500">
            আপনার সিমের বান্ডেল দিয়ে যেকোনো প্রজেক্ট থেকে কাস্টমারকে আনলিমিটেড ফাস্ট এসএমএস ও ওটিপি পাঠান।
          </p>
        </div>
      </div>

      {/* Multi-Project Reusability Architecture */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase">
              MULTI-PROJECT REUSABLE ARCHITECTURE
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              কীভাবে এই একটি অ্যান্ড্রয়েড অ্যাপ বিভিন্ন প্রজেক্টে রি-ইউজ করবেন?
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Dynamic QR Handshake Protocol</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> কোনো হার্ডকোডেড সার্ভার নেই (Zero Hardcoding)
            </span>
            <p className="text-slate-400 leading-relaxed">
              অ্যাপের মধ্যে কোনো নির্দিষ্ট সার্ভার URL ফিক্সড করা নেই। আপনি যখন যে প্রজেক্টের QR কোড স্ক্যান করবেন, অ্যাপটি ইনস্ট্যান্ট সেই প্রজেক্টের সাথে যুক্ত হয়ে যাবে।
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> ডুয়াল সিম অটো-সুইচিং (Dual SIM Auto-Switching)
            </span>
            <p className="text-slate-400 leading-relaxed">
              আপনার ফোনে গ্রামীণফোন, রবি বা বাংলালিংক যা-ই থাকুক না কেন, সার্ভার থেকে পাঠানো নির্দেশ অনুযায়ী নির্দিষ্ট সিম স্লট দিয়ে এসএমএস পৌঁছে যাবে।
            </p>
          </div>
        </div>

        {/* Live Payload Preview */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>CURRENT PAIRING PAYLOAD (QR DATA):</span>
            <span className="text-emerald-400">Ready to Scan</span>
          </div>
          <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto p-2 bg-slate-900/90 rounded-xl">
{JSON.stringify({
  protocol: "hssms-v1",
  endpoint: pairingEndpoint,
  token: pairingToken,
  deviceName: "Android Gateway Client"
}, null, 2)}
          </pre>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
              NATIVE KOTLIN SOURCE FILES
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">অ্যান্ড্রয়েড অ্যাপ সোর্স ফাইল সমূহ</h3>
            <p className="text-xs text-slate-500">Android Studio-তে ফাইলগুলো পেস্ট করে সরাসরি রান করুন।</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(activeCodeFile, CODE_SNIPPETS[activeCodeFile])}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {copiedSection === activeCodeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-300" />
                  <span>এই ফাইলটি কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'manifest', name: 'AndroidManifest.xml', icon: FileCode },
            { id: 'service', name: 'SmsGatewayService.kt', icon: Radio },
            { id: 'scanner', name: 'QRScannerActivity.kt', icon: QrCode },
            { id: 'main', name: 'MainActivity.kt', icon: Smartphone },
            { id: 'gradle', name: 'build.gradle.kts', icon: Terminal }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeFile(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCodeFile === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px]">
          <pre>
            <code>{CODE_SNIPPETS[activeCodeFile]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
