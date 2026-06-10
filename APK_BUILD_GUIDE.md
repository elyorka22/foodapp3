# FoodApp Customer Mobile — APK Build Guide

Build the customer Android APK **without Firebase**. Notification center, history, and backend templates remain; external push delivery uses `PUSH_PROVIDER=noop` until FCM is enabled.

---

## 1. GitHub Actions setup

Workflow file: [`.github/workflows/customer-mobile-apk.yml`](.github/workflows/customer-mobile-apk.yml)

Triggers:

- Push / PR to `main` or `master` when `apps/customer_mobile/**` changes
- Manual: **Actions → Customer Mobile APK → Run workflow**

Steps: checkout → validate env → Flutter stable → `flutter create` (Android) → `pub get` → `analyze` → `test` → `build apk --release` + `build appbundle --release` → upload artifacts.

---

## 2. Required GitHub secrets

Configure in **Settings → Secrets and variables → Actions**:

| Secret | Required | Example |
|--------|----------|---------|
| `API_BASE_URL` | **Yes** | `https://api.yourdomain.com/api/v1` |
| `WS_BASE_URL` | **Yes** | `https://api.yourdomain.com` |
| `TELEGRAM_BOT_USERNAME` | No | `YourBotName` (no `@`) |

**Must not** use `localhost`, `127.0.0.1`, or `10.0.2.2`.

**Not required for APK build:**

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `google-services.json`

Backend push defaults to noop when Firebase env is unset (`PUSH_PROVIDER` auto-selects `noop`).

---

## 3. Build APK locally

```bash
cd apps/customer_mobile
./scripts/bootstrap.sh   # first time: Flutter SDK + android/
chmod +x scripts/validate_build_env.sh

export API_BASE_URL=https://api.yourdomain.com/api/v1
export WS_BASE_URL=https://api.yourdomain.com
./scripts/validate_build_env.sh

flutter pub get
flutter analyze
flutter test
flutter build apk --release \
  --dart-define=API_BASE_URL="$API_BASE_URL" \
  --dart-define=WS_BASE_URL="$WS_BASE_URL" \
  --dart-define=TELEGRAM_BOT_USERNAME=YourBot
```

APK output: `build/app/outputs/flutter-apk/app-release.apk`

### Local emulator (debug only)

Debug runs may use emulator hosts; **release APK** rejects `10.0.2.2`:

```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1 \
  --dart-define=WS_BASE_URL=http://10.0.2.2:4000
```

---

## 4. Download artifacts

1. Open the repository on GitHub → **Actions**
2. Select the latest **Customer Mobile APK** run
3. Scroll to **Artifacts**
4. **Play Store:** download **foodapp-customer-aab** (`app-release.aab`) → upload in Google Play Console
5. **Direct install / QA:** download **foodapp-customer-apk** (`app-release.apk`)

### Play Store checklist

- Upload **AAB** (not APK) to Google Play Console
- `version` in `pubspec.yaml`: bump `+buildNumber` for each upload (e.g. `1.0.0+2`)
- Add release keystore SHA-1 to Firebase (Google Sign-In) if using Google login
- Fill admin settings: **Yordam (profil)** and **Hamkorlik (profil)** Telegram / phone
- Deploy backend + frontend before publishing (new `/settings/public` fields)

---

## 5. Enable Firebase later

### Mobile

1. Add dependencies to `pubspec.yaml`:
   - `firebase_core`
   - `firebase_messaging`
   - `flutter_local_notifications`
2. Restore implementation from `lib/core/push/_firebase_dormant/` (see README there)
3. Switch `push_providers.dart` to `FirebasePushNotificationService` when ready
4. Add `android/app/google-services.json` and Gradle Firebase plugin (FlutterFire CLI)

### Backend

```env
PUSH_PROVIDER=firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

See [PUSH_DELIVERY_REPORT.md](PUSH_DELIVERY_REPORT.md) and [NOTIFICATION_ARCHITECTURE.md](NOTIFICATION_ARCHITECTURE.md).

---

## What works without Firebase

| Feature | Status |
|---------|--------|
| Login / register / Telegram | ✅ |
| Restaurants, stores, cart, checkout | ✅ |
| Orders + tracking | ✅ |
| Notification center (HTTP) | ✅ |
| Device registration (no FCM token) | ✅ |
| System push tray (FCM) | ❌ until Firebase enabled |
