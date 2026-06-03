# FoodApp Customer Mobile — Final Release Report

**Date:** 2026-06-03  
**Phase:** Release stabilization (Critical + High fixes only — no new features)  
**Scope:** `apps/customer_mobile`

---

## Executive summary

All **Critical (C1–C4)** and requested **High (H1, H2, H4–H6)** items from `RELEASE_READINESS_REPORT.md` were addressed in code.

**Flutter verification** (`flutter analyze`, `flutter test`, `flutter build apk`) **could not be executed** on the stabilization machine — **Flutter SDK is not installed** (`flutter: command not found`). You must run the verification gate locally before commit.

---

## Fixed critical issues

| ID | Issue | Fix |
|----|--------|-----|
| **C1** | `deviceRegistrationServiceProvider` missing `TokenStorage` | Injected `ref.watch(tokenStorageProvider)` into provider constructor. Removed duplicate `_push.initialize()` from `registerAfterAuth()` (initialization only in `PushBootstrap`). |
| **C2** | Missing `resolveImageUrl` import | Added `import '../../core/utils/image_url.dart';` in `food_app_restaurant_card.dart`. |
| **C3** | Sensitive logging in release | `LogInterceptor` only added when `kDebugMode`; request/response headers logging disabled; no logging in release builds. |
| **C4** | Emulator default API URL | Removed `10.0.2.2` defaults. `API_BASE_URL` / `WS_BASE_URL` required via `--dart-define`. `AppConfig.ensureConfigured()` in `main()` rejects empty URLs and blocks release builds using localhost/emulator hosts. |

---

## Fixed high priority issues

| ID | Issue | Fix |
|----|--------|-----|
| **H1** | Duplicate Firebase listeners | `FirebasePushNotificationService` uses `_initialized` guard; cancels prior `StreamSubscription`s before re-bind; `device_registration_service` no longer calls `initialize()`. |
| **H2** | Order tracking poll errors wipe UI | Introduced `OrderTrackingSnapshot` with `isStale` + `pollError`; provider yields last good order on transient failure; screen shows stale banner, not full error (first load still errors with retry). |
| **H4** | Splash ignores auth loading | Splash `await ref.read(authStateProvider.future)` before routing to restaurants or complete profile. |
| **H5** | GPS permission handling | `LocationFailure` enum; permanent denial → settings button (`openAppSettings`); distinct Uzbek strings for denied / settings / GPS off / timeout. `CheckoutLocationResult` API. |
| **H6** | Dio retry + offline | `RetryInterceptor` (2 retries, GET/HEAD/OPTIONS, transient errors); `connectivity_plus` + `hasNetworkConnection()` in `ErrorInterceptor`; `AppStrings.networkOffline` / `networkTimeout` / `networkError`; `sendTimeout` on Dio. |

*Note: Report H2 also described token-refresh stacking — addressed by single FCM init path and single `onTokenRefresh` slot in push service.*

---

## Verification gate (run locally)

```bash
cd apps/customer_mobile
flutter pub get
flutter analyze
flutter test
flutter build apk \
  --dart-define=API_BASE_URL=https://YOUR_PRODUCTION_HOST/api/v1 \
  --dart-define=WS_BASE_URL=https://YOUR_PRODUCTION_HOST \
  --dart-define=TELEGRAM_BOT_USERNAME=your_bot
```

### Results on stabilization machine

| Command | Result |
|---------|--------|
| `flutter pub get` | **Not run** — Flutter SDK unavailable |
| `flutter analyze` | **Not run** — Flutter SDK unavailable |
| `flutter test` | **Not run** — Flutter SDK unavailable |
| `flutter build apk` | **Not run** — Flutter SDK unavailable |

IDE linter reported **no issues** on key edited Dart files.

---

## Remaining medium priority issues (deferred)

Not in scope for this stabilization pass; still tracked from `RELEASE_READINESS_REPORT.md`:

| ID | Summary |
|----|---------|
| M1 | `DioExceptionType` not fully mapped in all UI surfaces |
| M3 | No global 401 session clear at network layer |
| M4–M5 | Restaurants/stores empty vs error copy; no retry on list errors |
| M6 | Banner carousel still uses uncached `Image.network` |
| M7 | Store card does not use `resolveImageUrl` |
| M8 | No `CachedNetworkImage` placeholders / mem cache hints |
| M9 | Location cache has no TTL |
| M10 | `GoRouter` does not refresh on all auth transitions |
| M11 | Telegram WebView security surface |
| M12 | `socket_io_client` unused (stubs only) |
| M13–M15 | Backend batch push isolation; promotions placeholder; platform folders via bootstrap |

### High items not explicitly requested (still open)

| ID | Summary |
|----|---------|
| H7 | No offline request queue (retry helps transient failures only) |
| H8 | Profile watches `notificationsUnreadProvider` for guests |
| H9 | Restaurant detail products loading/error UI |
| H10 | Indexed shell keeps inactive tabs mounted |
| H11 | Checkout `TextEditingController` updates in `build` |
| H12 | Cart `_persist()` not awaited |
| Report H4 | Auth screens `DioException` catch vs `AsyncValue.guard` mismatch |

---

## Known limitations (unchanged)

- No full offline catalog or order queue
- Order tracking: HTTP polling only (5s)
- Android-first; requires `google-services.json` for FCM
- `API_BASE_URL` / `WS_BASE_URL` mandatory at build/run time
- Promotions screen remains placeholder content

---

## Files changed (stabilization)

| Area | Files |
|------|--------|
| Config | `lib/core/config/app_config.dart`, `lib/main.dart` |
| Network | `lib/core/network/dio_client.dart`, `interceptors/error_interceptor.dart`, `interceptors/retry_interceptor.dart`, `network_connectivity.dart` |
| Push | `lib/core/push/device_registration_service.dart`, `firebase_push_notification_service.dart` |
| Location | `lib/core/location/location_service.dart`, `location_failure.dart` |
| Orders | `lib/features/orders/providers/order_tracking_provider.dart`, `models/order_tracking_snapshot.dart`, `presentation/order_tracking_screen.dart` |
| Checkout / splash | `checkout_screen.dart`, `splash_screen.dart` |
| UI / strings | `food_app_restaurant_card.dart`, `lib/core/l10n/app_strings.dart` |
| Deps | `pubspec.yaml` (`connectivity_plus`) |
| Docs | `scripts/bootstrap.sh`, `README.md` (release defines) |

---

## Version 1 launch recommendation

### Verdict: **Go for closed beta** after local verification passes

1. Run all four Flutter commands above on a machine with Flutter SDK + Android SDK.
2. Smoke test on a **physical device** with production `API_BASE_URL` and Firebase configured.
3. Validate: login → register device → checkout GPS (deny/allow) → order → tracking (airplane mode blip shows stale banner) → push tap → tracking route.

### Do not ship to Play Store production until

- `flutter analyze` and `flutter test` pass with zero failures
- Release APK built with **production** `--dart-define` URLs (not emulator hosts)
- Manual QA checklist in `RELEASE_READINESS_REPORT.md` completed

### Acceptable for v1 beta with remaining Medium items

List empty states, image polish, and guest notification fetch can follow in a fast patch after beta feedback.

---

## Related documents

- `RELEASE_READINESS_REPORT.md` — Original audit
- `PUSH_DELIVERY_REPORT.md` — Push architecture
- `apps/customer_mobile/AUDIT_REPORT.md` — Priority 1 feature audit

---

*Stabilization pass complete. No new features or UI redesign were introduced.*
