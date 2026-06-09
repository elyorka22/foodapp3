# FoodApp Customer Mobile

Flutter customer application — fully isolated under `apps/customer_mobile`.

## Stack

- Flutter / Dart
- **GoRouter** — navigation
- **Riverpod** — state
- **Dio** — HTTP (`lib/core/network/`)
- **Freezed + json_serializable** — codegen for models (see `lib/shared/models/README.md`)

## Architecture

Feature-first:

```
lib/
  core/          # config, theme, router, network, storage
  features/      # auth, restaurants, stores, cart, checkout, profile, shell, splash
  shared/        # widgets, models
```

## Design

Matches the web design system (`frontend/src/lib/design-tokens.ts`):

- Primary `#FF6B00`
- Background `#F7F8FA`
- Card radius 16px, card shadow `0 2px 16px rgba(0,0,0,0.06)`

## Backend

Uses existing NestJS API — no duplicated business logic.

| Feature | Endpoints |
|---------|-----------|
| Banners | `GET /banners` |
| Restaurants | `GET /restaurants`, `GET /restaurants/:slug` |
| Stores | `GET /businesses`, `GET /business-types` |
| Products | `GET /products?restaurantId=` |
| Auth | `POST /customers/login`, `/customers/register`, `/auth/telegram` |
| Orders | `POST /orders/guest` |

## Push notifications

**Default (CI / APK builds):** No Firebase. Uses `PushNotificationServiceStub`; backend `PUSH_PROVIDER=noop`.  
In-app **notification center** and history work via HTTP API.

**Later (FCM):** See `lib/core/push/_firebase_dormant/README.md` and `APK_BUILD_GUIDE.md`.

On login, the app registers `deviceId` via `POST /notifications/devices` (push token optional).

## Getting started

```bash
./scripts/bootstrap.sh
flutter pub get
flutter analyze
flutter test
flutter run
```

### Release build (required before first commit)

```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://YOUR_API_HOST/api/v1 \
  --dart-define=WS_BASE_URL=https://YOUR_API_HOST \
  --dart-define=TELEGRAM_BOT_USERNAME=your_bot \
  --dart-define=ENABLE_FCM=true \
  --dart-define=GOOGLE_WEB_CLIENT_ID=278845357182-7ell2g4o06h42phpkl07jr7pjq2q2gug.apps.googleusercontent.com
```

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for the full pre-commit checklist.

### Google Sign-In (Android APK)

Error `sign_in_failed` / `ApiException: 10` means the APK signing certificate is not registered in Firebase.

1. Run `./scripts/print_android_signing_sha1.sh` (or check the **Print APK signing SHA-1** step in GitHub Actions).
2. Firebase Console → **Project settings** → app `com.foodapp.customer_mobile` → **Add fingerprint** (SHA-1 and SHA-256).
3. Download a fresh `google-services.json` and update GitHub secret `GOOGLE_SERVICES_JSON_CUSTOMER_B64`.
4. Rebuild the APK.

For consistent release signing in CI, set GitHub secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Bottom navigation

- Restoranlar
- Do'konlar
- Savat
- Profil

Guest browsing works without login.

## Telegram login

Production: wire Telegram SDK / `telegram_login` and send the signed payload to `POST /auth/telegram`.

Development: **Profil → Telegram orqali kirish** accepts manual payload fields.

## Android / iOS

`bootstrap.sh` runs `flutter create` for platform folders if missing. iOS uses the same codebase; configure signing in Xcode when releasing.
