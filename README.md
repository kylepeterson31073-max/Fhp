# 🐾 Daisy's Helping Paws - Android APK & Autonomous Telephony Architecture

Daisy's Helping Paws is a crowd-sourced GPS resource directory and autonomous AI advocacy platform for unhoused neighbors, families, and their companion animals.

---

## 📱 Android APK Generation via GitHub Actions

This repository includes automated CI/CD for compiling native Android APK packages (`app-debug.apk`) directly on GitHub.

### 🚀 1. Automated GitHub Actions Build

The workflow file is located at `.github/workflows/build-apk.yml`.

#### How to Trigger:
1. **Push or Merge to `main` / `master`**: GitHub automatically runs the Android compilation pipeline.
2. **Manual Trigger (Workflow Dispatch)**: Go to **Actions** → **Build Android APK** → **Run workflow**.

#### Where to Find Your Downloadable APK:
- Go to the **Actions** tab on your GitHub repository.
- Click the latest workflow run.
- Scroll down to **Artifacts** and download `daisys-helping-paws-debug-apk.zip` (contains `app-debug.apk`).
- When tagged or pushed to `main`, an automatic GitHub Release is generated with `app-debug.apk` attached!

---

### 💻 2. Local Android Studio / CLI Build

If you want to build locally on your development machine:

```bash
# 1. Install dependencies
npm install

# 2. Build the web app bundle
npm run build

# 3. Add and sync the Capacitor Android platform
npx cap add android
npx cap sync android

# 4. Open in Android Studio or compile debug APK directly
npm run build:apk

# Or compile APK via Gradle directly:
cd android
./gradlew assembleDebug
```

The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚡ Autonomous Phone, SMS & Email Telephony Engine

Daisy connects directly to the phone's native telephony hardware and messaging subsystem:

### 📞 1. DTMF Keypad Menu Auto-Dialer (RFC 3601)
When reaching state or municipal agency hotlines with complex interactive voice response (IVR) phone trees, Daisy automatically calculates the required dual-tone multi-frequency (DTMF) pause sequence.

* **Example Hotline**: `1-877-501-2233` (Washington DSHS)
* **Menu Options**: `1` (English) → `3` (Expedited Food Assistance) → `0` (Intake Worker)
* **Automated Dial String**: `tel:18775012233,1,,3,,0`

When dialed, the Android phone automatically transmits the keypad tones at timed intervals, bypassing hold menus and connecting directly to caseworker queues without requiring the user to memorize or punch numbers in stressful situations.

---

### 💬 2. 1-Tap Autonomous SMS Transmitter
Pre-configures standard SMS URI schemes (`sms:211?body=...`) with pre-filled emergency declarations, shelter bed inquiries, and SNAP zero-income declarations.

---

### 📧 3. Certified Agency Email Filing
Generates formal cover letters, proof-of-homelessness declarations, and legal citations directly routed to agency intake inboxes with `mailto:` intents and local vault encryption.

---

## 🛡️ Android Telephony Permissions in `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```
