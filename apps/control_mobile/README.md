# FoodApp Control

Flutter administrative app for **SUPER_ADMIN** (Android + Web).

Package name: `control_mobile`  
Path in monorepo: `apps/control_mobile/`  
Standalone Flutter package (own `pubspec.yaml`, `lib/`, `test/`, `web/`).

Uses the existing NestJS API (`POST /auth/login` with `client: "control"`).  
Does not replace FoodApp Business or the customer website.

## Features (current)

- SUPER_ADMIN login via `POST /auth/login` with `client: "control"`
- Android Dio uses Cronet (VPN/proxy like Chrome); dart:io fallback if needed
- Responsive shell: mobile bottom nav + desktop sidebar
- Live dashboard (`GET /analytics/dashboard`)
- Live lists: employees, businesses, orders, catalog, promotions, audit
- Settings read/save (`GET/PUT /settings/admin`)
- Separate secure session keys: `control_access_token` / `control_user_json`

## API configuration

The API base URL is compile-time only:

```text
--dart-define=API_BASE_URL=https://your-host/api/v1
```

`AppConfig` reads `String.fromEnvironment('API_BASE_URL')` and normalizes a trailing `/api/v1` if missing.  
Release builds reject localhost hosts.

Login payload always includes `client: "control"` (see `AppConfig.clientId`).

Do **not** put passwords, JWT secrets, or signing keys in dart-defines or this README.

## Run locally

```bash
cd apps/control_mobile
flutter pub get
```

### Web

```bash
flutter run -d chrome \
  --dart-define=API_BASE_URL=https://foodapp.uz/api/v1
```

### Android

`android/` is generated locally (gitignored). Bootstrap once:

```bash
flutter create . --org com.foodapp --project-name control_mobile --platforms=android
flutter run -d android \
  --dart-define=API_BASE_URL=https://foodapp.uz/api/v1
```

Android emulator → host machine API:

```bash
flutter run -d emulator-5554 \
  --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

## Analyze and test

```bash
cd apps/control_mobile
flutter analyze
flutter test
```

## Build Web (local)

```bash
cd apps/control_mobile
flutter build web --release \
  --dart-define=API_BASE_URL=https://foodapp.uz/api/v1
```

Output: `build/web/`

## GitHub Actions (isolated CI)

Workflow file: [`.github/workflows/control-mobile.yml`](../../.github/workflows/control-mobile.yml)  
Workflow name in the Actions UI: **Control Mobile**

### What it does

On push/PR to `main` that touch `apps/control_mobile/**` or the workflow file (and on `workflow_dispatch`), two jobs run **in parallel**:

**Web** (`build-web`):
1. `flutter pub get` / `analyze` / `test`
2. `flutter build web --release` with  
   `--dart-define=API_BASE_URL=${{ vars.CONTROL_API_BASE_URL }}`
3. Uploads artifact **`foodapp-control-web`** (7-day retention)

**Android APK** (`build-apk`):
1. Generates `android/` via `flutter create` (folder is gitignored)
2. `flutter build apk --release` with the same `CONTROL_API_BASE_URL`
3. Uploads artifact **`foodapp-control-apk`** (7-day retention)

APK is **debug-signed** (no Play Store keystore). For internal install only — not for Play publishing. Failure of the APK job does not block the Web artifact (separate job).

Path filters keep this workflow from running for Business, Courier, Customer, or website changes.

**CI does not deploy.** It only builds, tests, and uploads artifacts.

### Repository variable (required)

Configure a **repository variable** (not a secret), because the API URL is public:

1. GitHub → repository → **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Create: `CONTROL_API_BASE_URL`
3. Example value: `https://foodapp.uz/api/v1` (must be `https://`, reachable `/health`)

If the variable is missing, not HTTPS, points at localhost, or the health probe fails, the APK job **fails clearly** and does not upload an artifact.

The login screen shows `API: <host>` so you can confirm which host was baked into the build.

### Where to find runs and the artifacts

1. GitHub → **Actions** → workflow **Control Mobile**
2. Open a successful run
3. Download:
   - **`foodapp-control-web`** — static Web build (`build/web`)
   - **`foodapp-control-apk`** — `app-release.apk` (debug-signed)

### Build APK locally

```bash
cd apps/control_mobile
flutter create . --org com.foodapp --project-name control_mobile --platforms=android
flutter build apk --release \
  --dart-define=API_BASE_URL=https://foodapp.uz/api/v1
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

## Auth notes

- Client UI accepts only `SUPER_ADMIN` after login.
- Backend allowlist: when `client` is `control`, only `SUPER_ADMIN` receives a JWT.
- See `docs/BACKEND_CLIENT_AUTH.md`.
