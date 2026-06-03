# Customer Mobile — Networking Audit Report

**Date:** 2026-06-03  
**Configured secrets (GitHub CI):**
- `API_BASE_URL=https://foodapp.uz/api/v1`
- `WS_BASE_URL=https://foodapp.uz`

## Executive summary

| Check | Result |
|-------|--------|
| Double `/api/v1` in app paths | **PASS** — paths are `/restaurants`, `/banners`, etc.; prefix only in `baseUrl` |
| Repositories use shared `Dio` from `dioProvider` | **PASS** — all use `AppConfig` via `createDioClient` `baseUrl` |
| Forbidden hosts in `lib/` | **PASS** — none (only scripts/docs) |
| Production API reachable (curl) | **PASS** — `GET https://foodapp.uz/api/v1/restaurants` → **200** |
| APK `DioException [connection error]` | **Likely device/build/config** — server is up; use new diagnostics below |

The backend and URLs are correct. A connection error on a physical device usually means: APK built **without** `--dart-define`, secret whitespace, missing **INTERNET** in a custom manifest, or no network route to `foodapp.uz` (DNS/firewall/VPN).

---

## 1. URL construction

```
final URL = normalize(API_BASE_URL) + ApiPaths.path
```

Example:
- `API_BASE_URL` = `https://foodapp.uz/api/v1`
- `ApiPaths.restaurants` = `/restaurants`
- **Resolved:** `https://foodapp.uz/api/v1/restaurants` ✅

**Not used:** `https://foodapp.uz/api/v1/api/v1/restaurants` (no double prefix in code).

---

## 2. Forbidden string search (`lib/`)

| Pattern | Matches in `lib/` |
|---------|-------------------|
| `localhost` | None |
| `127.0.0.1` | None |
| `10.0.2.2` | None |
| `api/v1/api/v1` | None |

Scripts only: `bootstrap.sh`, `validate_build_env.sh`, `generate_screenshots.sh`.

---

## 3. Dio setup

| Item | Value |
|------|--------|
| `baseUrl` | `AppConfig.normalizedApiBaseUrl` (trimmed, no trailing `/`) |
| Interceptors | `UrlLogInterceptor` → `AuthInterceptor` → `RetryInterceptor` → `ErrorInterceptor` |
| Request logging | `[FoodApp HTTP] METHOD full-uri` on every request (`debugPrint` / logcat) |

---

## 4. Android `INTERNET`

`android/` is generated in CI via `flutter create`. `scripts/patch_android_permissions.sh` now **ensures**:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Flutter’s default template also includes INTERNET; the patch makes CI idempotent.

---

## 5. Startup diagnostics (added)

On launch, logcat shows:

- `API_BASE_URL` / `WS_BASE_URL` (raw + normalized)
- Duplicate `/api/v1` in base (bool)
- `platform` / `osVersion` (Android version string)
- `connectivity` / `hasNetwork`
- `appVersion` / `buildMode`

---

## 6. Temporary health check screen

**Profile → “Tarmoq diagnostikasi (temp)”** → `/network-health`

Runs:
- `GET /restaurants?limit=1`
- `GET /banners`

Shows per request:
- Expected URL
- Actual URL (`requestOptions.uri`)
- Status code
- Body preview
- Full `DioException` (type, message, response)

---

## 7. Every API endpoint used by the app

All requests go through `dioProvider` → `baseUrl: AppConfig.normalizedApiBaseUrl`.

| Client path | Method | Full URL (your secrets) | Auth | Repository | Server check |
|-------------|--------|---------------------------|------|--------------|--------------|
| `/banners` | GET | `https://foodapp.uz/api/v1/banners` | No | `RestaurantsRepository` | ✅ 200 (curl) |
| `/restaurants` | GET | `https://foodapp.uz/api/v1/restaurants` | No | `RestaurantsRepository` | ✅ 200 (curl) |
| `/restaurants/:id` | GET | `.../restaurants/{slug}` | No | `RestaurantsRepository` | ✅ route exists |
| `/products?restaurantId=` | GET | `.../products?restaurantId=` | No | `RestaurantsRepository` | ✅ |
| `/categories?businessId=` | GET | `.../categories?businessId=` | No | `RestaurantsRepository` | ✅ |
| `/business-types` | GET | `.../business-types` | No | `StoresRepository` | ✅ |
| `/businesses` | GET | `.../businesses` | No | `StoresRepository` | ✅ |
| `/businesses/:id` | GET | `.../businesses/{id}` | No | `StoresRepository` | ✅ |
| `/customers/register` | POST | `.../customers/register` | No | `AuthRepository` | ✅ |
| `/customers/login` | POST | `.../customers/login` | No | `AuthRepository` | ✅ |
| `/customers/me` | GET | `.../customers/me` | Bearer | `AuthRepository` | 401 without token (expected) |
| `/customers/complete-profile` | POST | `.../customers/complete-profile` | Bearer | `AuthRepository` | ✅ |
| `/auth/telegram` | POST | `.../auth/telegram` | No | `AuthRepository` | ✅ |
| `/orders/guest` | POST | `.../orders/guest` | No | `OrdersRepository` | ✅ |
| `/orders/track/:token` | GET | `.../orders/track/{token}` | No | `OrdersRepository` | ✅ |
| `/notifications` | GET | `.../notifications` | Bearer | `NotificationsRepository` | 401 without token |
| `/notifications/unread-count` | GET | `.../notifications/unread-count` | Bearer | `NotificationsRepository` | 401 without token |
| `/notifications/:id/read` | PATCH | `.../notifications/{id}/read` | Bearer | `NotificationsRepository` | ✅ |
| `/notifications/read-all` | POST | `.../notifications/read-all` | Bearer | `NotificationsRepository` | ✅ |
| `/notifications/devices` | POST | `.../notifications/devices` | Bearer | `DeviceRegistrationRepository` | ✅ |
| `/notifications/devices/unregister` | POST | `.../notifications/devices/unregister` | Bearer | `DeviceRegistrationRepository` | ✅ |

**WebSocket (not Dio):**
- `https://foodapp.uz/orders` — `orders_socket_service.dart` (stub)
- `https://foodapp.uz/notifications` — `notifications_socket_service.dart`

**Images:** `resolveImageUrl()` strips `/api/v1` from base → `https://foodapp.uz` + path ✅

---

## 8. Likely causes of `connection error` on device

1. **APK not built with dart-define** — app would crash at startup (`API_BASE_URL is required`). If app opens, defines are present.
2. **GitHub secret trailing newline/space** — fixed by `normalizedApiBaseUrl` trim + CI `validate_build_env.sh` strip.
3. **Wrong APK artifact** — sideload an older/local APK without production defines.
4. **Device network** — airplane mode, captive portal, DNS blocking `foodapp.uz`.
5. **SSL/TLS on old Android** — rare for `foodapp.uz`; health screen shows exact `DioException`.
6. **Not a double `/api/v1` issue** — verified in code and curl.

---

## 9. What to do on the failing device

1. Install the **latest CI APK** from GitHub Actions artifact `foodapp-customer-apk`.
2. Open **Profil → Tarmoq diagnostikasi (temp)** → **Run probes**.
3. On a PC with USB debugging:
   ```bash
   adb logcat | grep -E 'FoodApp HTTP|Startup diagnostics'
   ```
4. Confirm log lines show:
   ```
   [FoodApp HTTP] GET https://foodapp.uz/api/v1/restaurants?limit=1
   ```
   If URL is wrong or empty, the build defines are wrong.

---

## 10. Files changed in this audit

- `lib/core/network/interceptors/url_log_interceptor.dart`
- `lib/core/network/startup_diagnostics.dart`
- `lib/core/config/app_config.dart` — normalize URL, duplicate detection, `resolveRequestUrl`
- `lib/core/network/dio_client.dart`
- `lib/main.dart`
- `lib/features/debug/presentation/network_health_screen.dart`
- `lib/core/router/*`, `lib/features/profile/presentation/profile_screen.dart`
- `scripts/patch_android_permissions.sh`, `scripts/validate_build_env.sh`

Remove the temp health route and profile menu item after the issue is identified.
