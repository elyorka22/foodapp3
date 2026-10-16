# FoodApp Control

Flutter administrative app for **SUPER_ADMIN** (Android + Web).

Package name: `control_mobile`  
Path in monorepo: `apps/control_mobile/`  
Standalone Flutter package (own `pubspec.yaml`, `lib/`, `test/`, `web/`).

Uses the existing NestJS API (`POST /auth/login` with `client: "control"`).  
Does not replace FoodApp Business or the customer website.

## Features (current)

- SUPER_ADMIN login via `POST /auth/login` with `client: "control"`
- Responsive shell: mobile bottom nav + desktop sidebar
- Dashboard with clearly marked placeholder metrics
- Section placeholders: employees, businesses, orders, catalog, promotions, settings, audit
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

On push/PR to `main` that touch `apps/control_mobile/**` or the workflow file (and on `workflow_dispatch`):

1. `flutter pub get`
2. `flutter analyze`
3. `flutter test`
4. `flutter build web --release` with  
   `--dart-define=API_BASE_URL=${{ vars.CONTROL_API_BASE_URL }}`
5. Uploads artifact **`foodapp-control-web`** (7-day retention)

Path filters keep this workflow from running for Business, Courier, Customer, or website changes.

**CI does not deploy.** It only builds, tests, and uploads an artifact.

### Repository variable (required)

Configure a **repository variable** (not a secret), because the API URL is public:

1. GitHub → repository → **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Create: `CONTROL_API_BASE_URL`
3. Example value: `https://foodapp.uz/api/v1`

If the variable is missing or points at localhost, the workflow **fails clearly** and does not upload an artifact.

### Where to find runs and the artifact

1. GitHub → **Actions** → workflow **Control Mobile**
2. Open a successful run
3. Download artifact **`foodapp-control-web`**

### Android APK in CI

Not included in this workflow. `android/` is gitignored and there is no production signing setup for Control yet. Build APKs locally if needed.

## Auth notes

- Client UI accepts only `SUPER_ADMIN` after login.
- Backend allowlist: when `client` is `control`, only `SUPER_ADMIN` receives a JWT.
- See `docs/BACKEND_CLIENT_AUTH.md`.
