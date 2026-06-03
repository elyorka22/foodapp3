# FoodApp Customer Mobile — Audit Report (v2)

**Date:** 2026-06-03  
**Scope:** Priority 1 production blockers + pre-commit verification  
**Path:** `apps/customer_mobile`

---

## Executive summary

Priority 1 customer-usage blockers have been **implemented in code**:

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Real GPS on checkout | ✅ Implemented |
| 2 | Complete profile after Telegram (`needsPhone`) | ✅ Implemented |
| 3 | Order tracking screen + polling | ✅ Implemented |

**Pre-commit verification (flutter analyze / test / build apk)** could **not** be executed on the audit machine — **Flutter SDK is not installed**. Android/iOS platform folders are **not generated** until `./scripts/bootstrap.sh` runs locally.

**Do not commit** until the commands below succeed on a developer machine.

---

## Priority 1 — Implementation details

### 1. Real GPS integration ✅

**Files:**

- `lib/core/location/location_service.dart` — permission, GPS read, timeout, fallback
- `lib/core/location/location_storage.dart` — persists lat/lng/address in `SharedPreferences`
- `lib/core/location/location_providers.dart`
- `lib/features/checkout/presentation/checkout_screen.dart` — uses real coordinates for `POST /orders/guest`

**Behaviour:**

- Requests `locationWhenInUse` via `permission_handler`
- Reads position via `geolocator` (12s timeout, high accuracy)
- **Fallback order:** GPS → cached storage → error UI with retry button
- On successful checkout, saves coordinates + address to storage
- **Removed** hardcoded Tashkent coordinates

**Dependencies:** `geolocator`, `permission_handler`

**Platform setup required:**

- Android: `scripts/patch_android_permissions.sh` (run from `bootstrap.sh`)
- iOS: see `docs/IOS_LOCATION.md`

---

### 2. Complete profile flow ✅

**Files:**

- `lib/features/auth/presentation/complete_profile_screen.dart`
- `lib/features/auth/data/auth_repository.dart` — `POST /customers/complete-profile`
- `lib/features/auth/providers/auth_provider.dart` — `completeProfile()`, `needsPhoneCompletion`
- `lib/core/router/app_router.dart` — route `/complete-profile` + redirect guard

**Behaviour:**

- After Telegram login, if `user.needsPhone == true` → navigate to Complete Profile
- Splash also routes to complete profile when session has `needsPhone`
- Collects **phone** → calls backend → refreshes JWT + user (backend may merge accounts)
- On success → `context.go(/restaurants)`

**API:** Matches `CompleteProfileDto` (`phone` required; optional address/lat/lng for future).

---

### 3. Order tracking ✅

**Files:**

- `lib/features/orders/presentation/order_tracking_screen.dart`
- `lib/features/orders/providers/order_tracking_provider.dart` — polls every 5s
- `lib/shared/models/order_track_model.dart`
- `lib/core/orders/order_status_steps.dart` — 6-step timeline
- `lib/features/checkout/data/orders_repository.dart` — `GET /orders/track/:token`

**Timeline (Uzbek):**

1. Buyurtma qabul qilindi (`PENDING`)
2. Tasdiqlandi (`ACCEPTED`)
3. Tayyorlanmoqda (`PREPARING`)
4. Tayyor (`COURIER_ASSIGNED`, `PICKED_UP`)
5. Yo'lda (`DELIVERING`)
6. Yetkazildi (`DELIVERED`)

**After checkout:** navigates to `/track/:trackingToken` when token present.

**WebSocket:** `lib/core/realtime/orders_socket_service.dart` documents `joinOrder` / `orderUpdated`; polling remains default.

---

## API verification (unchanged + additions)

| Endpoint | Used | Match |
|----------|------|-------|
| `POST /orders/guest` | Checkout | ✅ Body uses real `latitude`/`longitude` |
| `GET /orders/track/:token` | Tracking poll | ✅ Matches `serializeOrder` |
| `POST /customers/complete-profile` | Complete profile | ✅ Returns `{ accessToken, user }` |

---

## Completed (cumulative)

- [x] Feature-first architecture under `apps/customer_mobile`
- [x] Dio + Riverpod + GoRouter + design tokens
- [x] Cart persistence (`SharedPreferences`)
- [x] Telegram WebView widget (not dev form)
- [x] Custom bottom navigation
- [x] **Priority 1: GPS, complete profile, order tracking**
- [x] Architecture stubs: push, WebSocket, courier tracking, iOS checklist
- [x] Unit test: `test/order_status_steps_test.dart`

---

## Still missing (Priority 2 / post-commit)

- [ ] Freezed `build_runner` codegen
- [ ] Push notifications (FCM)
- [ ] Courier live map tracking
- [ ] iOS polish / TestFlight
- [ ] Product grid UI parity with web
- [ ] Promo code on checkout
- [ ] Public config endpoint for Telegram bot name
- [ ] Real device screenshots (replace placeholders in `docs/screenshots/`)

---

## Technical debt

1. Manual JSON models (no generated Freezed yet)
2. `GoRouter` redirect uses `ref.read` — may need `refreshListenable` when auth changes mid-session
3. Checkout delivery/payment radios still UI-only (API uses CASH)
4. `Dio LogInterceptor` enabled in all builds — disable in release
5. Order tracking stream stops polling after terminal state (by design); no manual refresh button except re-enter screen

---

## Production blockers before commit

| # | Blocker | Status |
|---|---------|--------|
| 1 | `flutter analyze` passes | ⏳ **Must run locally** |
| 2 | `flutter test` passes | ⏳ **Must run locally** |
| 3 | `flutter build apk` succeeds | ⏳ **Must run locally** |
| 4 | `flutter create` / `bootstrap.sh` for `android/` + `ios/` | ⏳ **Must run locally** |
| 5 | `TELEGRAM_BOT_USERNAME` dart-define in release | Config |
| 6 | Physical device API URL (not `10.0.2.2`) | Config |

---

## Pre-commit commands (required)

```bash
cd apps/customer_mobile
./scripts/bootstrap.sh

flutter analyze
flutter test

flutter build apk \
  --dart-define=API_BASE_URL=http://YOUR_LAN_IP:4000/api/v1 \
  --dart-define=TELEGRAM_BOT_USERNAME=your_bot_name
```

**Manual QA:**

1. Checkout → allow location → place order → tracking screen updates
2. Telegram login (test bot) → complete profile if `needsPhone`
3. Kill app → cart still has items

---

## Screenshots

Previous placeholders remain in `docs/screenshots/`. Regenerate from running app after Flutter build succeeds.

---

## Commit gate

**Commit only when:**

- All Priority 1 items above are verified on device/emulator, **and**
- `flutter analyze`, `flutter test`, and `flutter build apk` complete without errors.

---

*End of audit report v2.*
