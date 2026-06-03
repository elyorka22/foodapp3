# FoodApp Release Readiness Report

**Date:** 2026-06-03  
**Scope:** Production readiness review before first commit — **no new features**, audit only.  
**Primary target:** `apps/customer_mobile` (Flutter customer app)  
**Supporting:** Backend push delivery (`backend/src/modules/notifications`), existing `AUDIT_REPORT.md` context

---

## Executive summary

The customer mobile app has solid feature coverage (auth, catalog, cart, GPS checkout, order tracking, notification center) and several good patterns (`cartProvider.select`, `FutureProvider.autoDispose` on lists, notification screen retry/refresh). **It is not production-ready as-is** for a first Android release.

**Blockers:** At least one **compile-time defect** in device registration wiring, a likely **missing import** for image URL resolution, and **release-unsafe logging** of API bodies. Operational gaps include **no HTTP retry**, **fragile order-tracking polling**, and **FCM listener duplication** risk.

**Recommendation:** Fix all **Critical** items and most **High** items below, then run the mandatory verification gate (`flutter analyze`, `flutter test`, release APK with production `--dart-define`) before the first commit. See [Version 1 launch recommendation](#version-1-launch-recommendation).

---

## Audit areas (summary)

| Area | Rating | Notes |
|------|--------|--------|
| Flutter performance | ⚠️ Medium risk | Indexed stack keeps all tabs alive; banner `Image.network` uncached |
| Riverpod lifecycle | ⚠️ High risk | Global cart/auth OK; tracking stream throws away state on error |
| Dio error handling | ⚠️ High risk | No retry; generic offline copy; auth errors not unified |
| Notification delivery | ✅ Acceptable (server) | DB-first; push failures logged, not retried; invalid tokens cleared |
| GPS permission denial | ⚠️ High risk | Silent `null`; no settings deep link; one generic message |
| Network timeouts | ⚠️ Medium risk | 15s/30s set; no `sendTimeout`; no `DioExceptionType` mapping |
| Empty states | ⚠️ Medium risk | Notifications/cart OK; restaurants/stores weak |
| Image loading | ⚠️ High risk | Missing import; store/detail URLs inconsistent |

---

## Critical issues

*Must fix before any production build or store submission.*

### C1 — `DeviceRegistrationService` provider missing constructor argument

**File:** `apps/customer_mobile/lib/core/push/device_registration_service.dart`

`deviceRegistrationServiceProvider` (lines 17–22) passes three dependencies; `DeviceRegistrationService` requires four (`TokenStorage` as `_tokenStorage`). **`registerAfterAuth()` reads `_tokenStorage`**, which is never injected via the provider.

**Impact:** Dart analyzer / compile failure, or runtime crash on first push registration after login. Push device registration and FCM token upload will not work reliably.

---

### C2 — Missing `resolveImageUrl` import on restaurant card

**File:** `apps/customer_mobile/lib/shared/widgets/food_app_restaurant_card.dart` (line 70)

Calls `resolveImageUrl(...)` without importing `lib/core/utils/image_url.dart`.

**Impact:** Static analysis / build failure unless another file exports the symbol (none found).

---

### C3 — `LogInterceptor` enabled in all builds

**File:** `apps/customer_mobile/lib/core/network/dio_client.dart` (line 27)

`LogInterceptor(requestBody: true, responseBody: true)` is always attached — not gated on `kDebugMode`.

**Impact:** Production logs may contain JWTs, phone numbers, addresses, and order payloads — security/compliance risk and minor I/O overhead.

---

### C4 — Default API base URL points at emulator localhost

**File:** `apps/customer_mobile/lib/core/config/app_config.dart`

Defaults: `http://10.0.2.2:4000/api/v1` and matching WS host.

**Impact:** Release APK without `--dart-define=API_BASE_URL=...` will fail all API calls on real devices. Documented in README but easy to miss in CI/release pipeline.

---

## High priority issues

*Fix before public launch; some may be acceptable for closed beta with documented workarounds.*

### H1 — FCM / push `initialize()` may register duplicate listeners

**Files:**

- `apps/customer_mobile/lib/core/push/firebase_push_notification_service.dart` (lines 62–74)
- `apps/customer_mobile/lib/core/push/device_registration_service.dart` (`registerAfterAuth` calls `_push.initialize()`)
- `apps/customer_mobile/lib/core/push/push_bootstrap.dart` (also calls `initialize()`)

Each `initialize()` adds new `FirebaseMessaging.onMessage`, `onMessageOpenedApp`, and `onTokenRefresh` listeners without canceling prior subscriptions.

**Impact:** Duplicate local notifications, multiple deep-link navigations, duplicate token refresh registrations — memory leak and unstable UX over a long session.

---

### H2 — `onTokenRefresh` handler stacked on every login

**File:** `device_registration_service.dart` (lines 56–63)

Registers `_push.onTokenRefresh` inside `registerAfterAuth()` without clearing previous handlers.

**Impact:** N registrations after N logins → N backend device updates per token refresh.

---

### H3 — Order tracking: poll error replaces entire UI

**File:** `apps/customer_mobile/lib/features/orders/providers/order_tracking_provider.dart` (lines 14–21)

On any `trackOrder` failure, the stream rethrows → `AsyncError` with **no last-known order** retained.

**Impact:** Brief network blip during tracking shows full-screen error instead of stale timeline + retry — poor stability perception.

---

### H4 — Auth screens: `DioException` catch often never runs

**Files:** `login_screen.dart`, `register_screen.dart`, `complete_profile_screen.dart`

`AuthNotifier` uses `AsyncValue.guard` and does **not** rethrow. UI `on DioException` blocks may not run; failures surface only as `authStateProvider` error if the widget watches it (many only `pop()` on success).

**Impact:** Silent login/register failures or confusing navigation — crash prevention gap (user thinks login worked).

---

### H5 — Splash does not await auth resolution

**File:** `apps/customer_mobile/lib/features/splash/splash_screen.dart` (lines 21–28)

Fixed 1.2s delay then `ref.read(authStateProvider).valueOrNull`. During `AsyncLoading`, value is `null`.

**Impact:** Logged-in users may flash guest route (`/restaurants`) before session loads; `needsPhone` redirect can be skipped or delayed incorrectly.

---

### H6 — GPS permission permanently denied not distinguished

**File:** `apps/customer_mobile/lib/core/location/location_service.dart`

`ensurePermission()` returns `false` for denied and permanently denied alike. No `openAppSettings()`. Checkout shows single `locationUnavailable` string.

**Impact:** Users who tap “Don’t allow” cannot recover without app settings guidance — checkout blocked with unclear copy.

---

### H7 — No API retry or offline awareness

**Files:** `dio_client.dart`, entire `lib/features/**/data/`

No retry interceptor, no connectivity check, no offline queue.

**Impact:** Transient failures on mobile networks fail immediately; user must manually retry screen-by-screen (only notifications/restaurants partially support retry).

---

### H8 — Profile fetches notifications for guests

**File:** `apps/customer_mobile/lib/features/profile/presentation/profile_screen.dart` (line 19)

`ref.watch(notificationsUnreadProvider)` without gating on logged-in user.

**Impact:** Unauthenticated 401s (handled as error or noise), wasted rebuilds/battery, possible error flicker.

---

### H9 — Restaurant detail: products loading/error invisible

**File:** `apps/customer_mobile/lib/features/restaurants/presentation/restaurant_detail_screen.dart` (lines 39–40)

Uses `productsAsync.value ?? []` with no loading/error UI for the products provider.

**Impact:** Empty menu while loading or on API failure — looks like “no products” instead of error state.

---

### H10 — Stateful shell keeps all tabs mounted

**File:** `apps/customer_mobile/lib/core/router/app_router.dart` (`StatefulShellRoute.indexedStack`)

Inactive tabs still hold widgets and may keep `FutureProvider` subscriptions warm.

**Impact:** Extra memory and parallel network calls when switching tabs — performance on low-end Android.

---

### H11 — Checkout mutates `TextEditingController` in `build`

**File:** `checkout_screen.dart` (lines 76–81)

Sets `_phone.text` / `_address.text` during `build` when user fields populate.

**Impact:** Extra rebuilds, possible cursor/focus bugs — stability risk on checkout.

---

### H12 — Cart persistence not awaited

**File:** `apps/customer_mobile/lib/features/cart/providers/cart_provider.dart`

`_persist()` is `async` but called without `await` from sync mutators.

**Impact:** Process kill immediately after add-to-cart may lose cart — data integrity on Android.

---

### H13 — Backend push: no transient retry

**Files:** `backend/.../push-delivery.service.ts`, `firebase-push.provider.ts`

FCM failures are logged; invalid tokens cleared; **no retry queue** for network blips.

**Impact:** User may miss push while in-app history exists — acceptable if understood; not a crash but delivery gap.

---

## Medium priority issues

*Polish and scale; can follow shortly after v1 if Critical/High are addressed.*

### M1 — `ErrorInterceptor` does not map `DioExceptionType`

**File:** `error_interceptor.dart`

Timeouts, connection errors, and cancel all collapse to `err.message` or `'Tarmoq xatosi'`.

**Impact:** Users cannot tell offline vs server error vs slow network.

---

### M2 — No `sendTimeout` on Dio `BaseOptions`

**File:** `dio_client.dart`, `app_config.dart`

**Impact:** Large request bodies could hang on upload edge cases.

---

### M3 — No 401 session cleanup at network layer

**File:** `auth_interceptor.dart`

Token attached but expired JWT not cleared globally.

**Impact:** Cascading 401s until user manually re-logs in.

---

### M4 — Restaurants list: empty vs error conflated

**File:** `restaurants_screen.dart` (line 110)

Empty list shows `AppStrings.errorGeneric`.

**Impact:** Misleading empty state.

---

### M5 — Restaurants/stores error UI: raw `Text('$e')`, no retry

**Files:** `restaurants_screen.dart`, `stores_screen.dart`

Unlike `notifications_screen.dart` (has retry button).

---

### M6 — Banner carousel uses uncached `Image.network`

**File:** `restaurants_screen.dart` (~line 79)

**Impact:** Memory churn and repeat downloads when scrolling home.

---

### M7 — Store card skips `resolveImageUrl`

**File:** `food_app_store_card.dart` — raw `logoUrl` / `coverUrl`

**Impact:** Relative or CDN-prefixed paths may fail while restaurant card works (once C2 fixed).

---

### M8 — `CachedNetworkImage` without placeholder / mem cache hints

**Files:** `food_app_restaurant_card.dart`, `food_app_store_card.dart`

Only `errorWidget`; no `placeholder` or `memCacheWidth`/`memCacheHeight`.

**Impact:** Layout flicker in lists; higher memory on long lists.

---

### M9 — Location cache has no TTL

**File:** `location_storage.dart` / `location_service.dart`

Cached coordinates reused indefinitely when `forceRefresh: false`.

**Impact:** Stale delivery location if user moved significantly.

---

### M10 — `GoRouter` not refreshed on auth changes

**File:** `app_router.dart` — `redirect` uses one-time `ref.read` for `needsPhone`

**Impact:** Edge cases after login/logout without navigation may leave wrong route until manual navigation.

---

### M11 — Telegram `WebView` + unrestricted JavaScript

**File:** `telegram_login_screen.dart`

**Impact:** Security surface; WebView lifecycle tied to route pop only — acceptable for v1 if Telegram-only URL.

---

### M12 — `socket_io_client` in pubspec, realtime stubs only

**Files:** `orders_socket_service.dart`, `notifications_socket_service.dart`

**Impact:** Dead dependency weight; polling-only for tracking/notifications live updates.

---

### M13 — `sendToMany` notification batch not fault-isolated

**File:** `backend/.../notifications.service.ts`

`Promise.all` on `sendToUser` — one template failure can reject batch.

**Impact:** Manager broadcast partial failure (server-side, not mobile crash).

---

### M14 — Promotions screen is static placeholder

**File:** `promotions_screen.dart`

**Impact:** PROMOTION push deep link lands on empty content — acceptable for v1 if no PROMOTION pushes sent yet.

---

### M15 — Platform folders / Flutter CI not verified in repo audit

**Reference:** `apps/customer_mobile/AUDIT_REPORT.md`

`android/` / `ios/` may be missing until `bootstrap.sh`; `flutter analyze` / `test` / `build apk` not run on audit host.

**Impact:** Unknown compile/lint state until local gate passes.

---

## Positive findings (stability)

- **Notification center:** loading, empty, error + retry, pull-to-refresh (`notifications_screen.dart`).
- **Checkout location:** loading spinner, error text, retry via “detect location” (`checkout_screen.dart`).
- **Cart badge:** `cartProvider.select` avoids full cart rebuilds (`main_shell_screen.dart`).
- **Detail quantity:** per-row `cartProvider.select` (`restaurant_detail_screen.dart`).
- **Backend notifications:** history always written first; invalid FCM tokens removed from `user_devices`; per-device push errors do not roll back DB row.
- **Location service:** 12s GPS timeout, permission request, cache fallback chain.
- **Timeouts:** 15s connect / 30s receive configured centrally.

---

## Known limitations (v1)

| Limitation | User impact |
|------------|-------------|
| No offline mode or request queue | App requires network for browse/order |
| Order tracking is HTTP poll (5s), not WebSocket | Slight delay vs real-time; more battery on tracking screen |
| Web customer app FCM optional | Web push not required for mobile v1 |
| iOS push / APNs stub on backend | Android-first launch |
| `courier_mobile` / `manager_mobile` not in repo | Staff use web; staff device registration on web only |
| Firebase requires `google-services.json` | Push silent until Firebase configured |
| Freezed/codegen models optional | Manual JSON parsing — maintain carefully |
| No analytics/crash reporting (Firebase Crashlytics, etc.) | Production crashes may go unreported |

---

## Version 1 launch recommendation

### Verdict: **Conditional go** (closed beta / internal QA only)

**Do not** ship to Play Store production until:

1. **C1–C4** are resolved and verified on a **physical Android device** with production API URL and Firebase configured.
2. **H1–H2** (push listener duplication) and **H4–H5** (auth/splash) are fixed — these directly affect crashes, silent failures, and session correctness.
3. **H3** (tracking error UX) and **H6** (permission denied UX) are addressed for core order flows.
4. Mandatory gate from `AUDIT_REPORT.md` passes locally:

```bash
cd apps/customer_mobile
./scripts/bootstrap.sh
flutter analyze
flutter test
flutter build apk \
  --dart-define=API_BASE_URL=https://YOUR_API/api/v1 \
  --dart-define=WS_BASE_URL=https://YOUR_API
```

### Suggested launch scope for v1.0

| In scope | Out of scope (defer) |
|----------|----------------------|
| Android customer app (restaurants, stores, cart, checkout, tracking) | iOS store release |
| Phone + Telegram auth, complete profile | Courier/manager native apps |
| In-app notification center + FCM (configured env) | Offline catalog browsing |
| GPS checkout with cache fallback | WebSocket live tracking |
| Uzbek UI strings | Full promotions CMS in app |

### Risk acceptance (if shipping beta with open High items)

- **H7/H13:** Accept manual retry; document known “tap again on poor network.”
- **H10:** Accept on mid-range devices for beta; monitor memory.
- **M6–M8:** Accept image flicker if CDN stable.

**Not acceptable even for beta:** C1, C2, C3, C4, H4, H5 without explicit QA sign-off.

---

## Pre-commit checklist (no feature work)

- [ ] Fix Critical issues C1–C2 (compile)
- [ ] Gate `LogInterceptor` (C3) and document release `dart-define` (C4)
- [ ] Run `flutter analyze` — zero errors
- [ ] Run `flutter test`
- [ ] Release APK smoke: login → browse → cart → GPS checkout → order → tracking → notification list
- [ ] Push smoke: device row in `user_devices` with token; order status change receives tray notification; tap opens tracking
- [ ] Deny location permission → verify checkout messaging / recovery path
- [ ] Airplane mode during tracking → verify behavior (document if unfixed H3)
- [ ] Backend: `FIREBASE_*` env set; sample ORDER_* push delivers

---

## Related documents

- `apps/customer_mobile/AUDIT_REPORT.md` — Priority 1 feature audit
- `NOTIFICATION_ARCHITECTURE.md` — Notification platform design
- `PUSH_DELIVERY_REPORT.md` — FCM registration and delivery
- `apps/customer_mobile/README.md` — Build and Firebase setup

---

*This report is audit-only. No features were added or changed during its generation.*
