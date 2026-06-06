# FCM Deployment Guide

Production checklist for enabling Firebase Cloud Messaging across backend and mobile apps.

## Backend environment variables

Set these on your API server (Docker, DigitalOcean, etc.):

| Variable | Required | Description |
|----------|----------|-------------|
| `PUSH_PROVIDER` | Yes | Set to `firebase` to enable FCM (default: `noop`) |
| `FIREBASE_PROJECT_ID` | Recommended | Firebase project ID; inferred from service account if omitted |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | One of* | Full service account JSON as a single-line string |
| `GOOGLE_APPLICATION_CREDENTIALS` | One of* | Absolute path to service account JSON file on disk |

\* Provide either `FIREBASE_SERVICE_ACCOUNT_JSON` **or** `GOOGLE_APPLICATION_CREDENTIALS`, not both unless they point to the same account.

### Example (Docker Compose)

```yaml
services:
  api:
    environment:
      PUSH_PROVIDER: firebase
      FIREBASE_PROJECT_ID: foodapp-prod
      FIREBASE_SERVICE_ACCOUNT_JSON: ${FIREBASE_SERVICE_ACCOUNT_JSON}
```

Store the JSON in your secrets manager; never commit it to git.

### Deployment steps

1. Apply database migrations (includes FCM notification templates):

   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. Set `PUSH_PROVIDER=firebase` and Firebase credentials.
3. Restart the API process.
4. Confirm startup log: `Firebase Admin SDK initialized`.
5. Send a test notification (assign an order to a courier with a registered device).

## Mobile APK deployment (CI)

GitHub Actions workflows build release APKs with FCM enabled:

- `.github/workflows/customer-mobile-apk.yml`
- `.github/workflows/courier-mobile-apk.yml`

### Required GitHub secrets

| Secret | Used by |
|--------|---------|
| `API_BASE_URL` | Both apps |
| `WS_BASE_URL` | Both apps |
| `GOOGLE_SERVICES_JSON_CUSTOMER` | Customer APK |
| `GOOGLE_SERVICES_JSON_COURIER` | Courier APK |
| `TELEGRAM_BOT_USERNAME` | Customer (optional) |

### CI build flow

1. `flutter create` generates Android project (`com.foodapp.customer_mobile` / `com.foodapp.courier_mobile`).
2. `setup_firebase_android.sh` writes `google-services.json` and patches Gradle for Google Services plugin.
3. `flutter build apk --release --dart-define=ENABLE_FCM=true` produces FCM-enabled APK.

### Manual release build

```bash
cd apps/customer_mobile
flutter create . --org com.foodapp --project-name customer_mobile --platforms=android
export GOOGLE_SERVICES_JSON="$(cat /path/to/google-services.json)"
./scripts/setup_firebase_android.sh
flutter pub get
flutter build apk --release \
  --dart-define=ENABLE_FCM=true \
  --dart-define=API_BASE_URL=https://api.yourdomain.com \
  --dart-define=WS_BASE_URL=wss://api.yourdomain.com
```

Repeat for `apps/courier_mobile` with courier `google-services.json`.

## Token lifecycle

1. User logs in → app requests FCM permission → obtains token.
2. App calls device registration API with `pushToken`.
3. Backend stores token in `user_devices` with role (`CUSTOMER` / `COURIER` / `STAFF`).
4. On token refresh, app re-registers automatically.
5. On logout, app clears token via unregister endpoint.
6. Invalid tokens are cleared by backend when FCM rejects them.

## Monitoring

- **Backend logs:** `FCM delivered`, `Cleared invalid push token`, `FCM delivery failed`
- **Firebase Console:** Cloud Messaging delivery reports (optional)
- **Database:** `SELECT push_token FROM user_devices WHERE push_token IS NOT NULL`

## Rollback

To disable FCM without redeploying mobile apps:

```env
PUSH_PROVIDER=noop
```

In-app notifications and WebSocket delivery continue; only FCM transport stops.

Mobile apps with `ENABLE_FCM=true` still register tokens, but backend ignores push delivery until `PUSH_PROVIDER=firebase` is restored.

## Security notes

- Restrict service account to Firebase Admin / Cloud Messaging only where possible.
- Rotate service account keys periodically.
- Do not expose `FIREBASE_SERVICE_ACCOUNT_JSON` in client apps or logs.
- `google-services.json` is safe to embed in mobile apps (client config, not a secret).
