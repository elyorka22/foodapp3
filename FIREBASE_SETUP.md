# Firebase Setup (FoodApp)

This guide covers Firebase Cloud Messaging (FCM) setup for the FoodApp monorepo: backend Admin SDK, Android mobile apps, and local development.

## Firebase project

1. Create or open your Firebase project in [Firebase Console](https://console.firebase.google.com/).
2. Register Android apps:

| App | Package name |
|-----|----------------|
| Customer | `com.foodapp.customer_mobile` |
| Courier | `com.foodapp.courier_mobile` |
| Business | `com.foodapp.business_mobile` |

3. Download `google-services.json` for each app from **Project settings → Your apps**.

## Backend — Firebase Admin SDK

### Service account

1. Firebase Console → **Project settings → Service accounts**.
2. Click **Generate new private key** and save the JSON file securely.
3. Configure the backend using **one** of these options:

**Option A — inline JSON (recommended for Docker / PaaS):**

```env
PUSH_PROVIDER=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

Paste the full service account JSON on a single line, or use your platform's secret manager.

**Option B — file path (recommended for local dev):**

```env
PUSH_PROVIDER=firebase
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json
```

### Verify backend

```bash
cd backend
npm run build
# Set PUSH_PROVIDER=firebase and credentials in .env, then start API
```

When a notification is sent, logs show `Firebase Admin SDK initialized` on startup and `FCM delivered` on success.

## Customer mobile (Android)

Package: `com.foodapp.customer_mobile`  
Config file: `apps/customer_mobile/google-services.json` (copied to `android/app/` by `setup_firebase_android.sh`)

### Disable FCM locally (stub transport)

```bash
flutter run --dart-define=ENABLE_FCM=false
```

In-app notifications still work via HTTP/WebSocket; only FCM transport is disabled.

## Courier mobile (Android)

Package: `com.foodapp.courier_mobile`  
Config file: `apps/courier_mobile/google-services.json` (copied to `android/app/` by `setup_firebase_android.sh`)

## Business mobile (Android)

Package: `com.foodapp.business_mobile`  
Config file: `apps/business_mobile/google-services.json` (copied to `android/app/` by `setup_firebase_android.sh`)

## Architecture overview

```
Order / courier event
  → NotificationService.sendToUser (DB + WebSocket)
  → PushDeliveryService.deliverNotification
  → FirebasePushProvider.sendToUser (FCM Admin SDK)
  → Device FCM token (user_devices.push_token)
```

Mobile apps:

1. Request notification permission.
2. Obtain FCM token via `firebase_messaging`.
3. Register token: `POST /notifications/devices/register` (customer) or `POST /couriers/devices/register` (courier).
4. Handle foreground (local notification), background, and terminated (tap → deep link).

## Notification channel

Android channel ID **`foodapp_default`** is used by both backend FCM payloads and mobile local notifications. Do not change without updating both sides.

## Push notification events

| Event | Recipient | Template / trigger |
|-------|-----------|-------------------|
| Courier assigned | Courier | `ORDER_ASSIGNED` |
| Courier accepted | Customer | `COURIER_ACCEPTED` |
| Arrived at restaurant | Customer | `ORDER_PREPARING` (status map) |
| Order picked up | Customer | `ORDER_DELIVERING` |
| Delivering | Customer | `ORDER_DELIVERING` |
| Delivered | Customer | `ORDER_COMPLETED` |
| Courier declined | Managers | `ORDER_PROBLEM` via `notifyManagersCourierDeclined` |
| Manager reassignment / removal | Previous courier | `COURIER_UNASSIGNED` |
| Order cancelled (courier assigned) | Courier | `ORDER_CANCELLED` |

## CI secrets (GitHub Actions)

| Secret | Description |
|--------|-------------|
| `GOOGLE_SERVICES_JSON_CUSTOMER` | Full contents of customer `google-services.json` |
| `GOOGLE_SERVICES_JSON_COURIER` | Full contents of courier `google-services.json` |
| `GOOGLE_SERVICES_JSON_BUSINESS` | Full contents of business `google-services.json` |
| `GOOGLE_SERVICES_JSON_BUSINESS_B64` | Optional: base64-encoded business JSON |

See [FCM_DEPLOYMENT.md](./FCM_DEPLOYMENT.md) for production deployment.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Firebase Admin not configured` | Set `PUSH_PROVIDER=firebase` and service account env vars |
| No push on device | Confirm token in `user_devices.push_token`; check backend logs |
| Release APK build fails | Ensure `google-services.json` exists under `android/app/` |
| Invalid token in logs | Backend auto-clears stale tokens; re-login on device |
