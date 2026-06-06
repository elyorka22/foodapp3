# FCM Preparation Report

Prepared push notification architecture for FoodApp **without enabling Firebase**. Builds remain unchanged; default transport is `noop`.

## Summary

| Area | Status |
|------|--------|
| Backend `PushProvider` (`sendToUser` / `sendToMany`) | ✅ |
| `NoopPushProvider` (default) | ✅ |
| `FirebasePushProvider` (stub, no Admin init) | ✅ |
| `user_devices.role` column | ✅ migration added |
| Customer device APIs | ✅ + `/register` alias |
| Courier device APIs | ✅ new |
| Customer mobile stub + registration | ✅ already existed, path updated |
| Courier mobile stub + registration | ✅ new |
| Event hooks | ✅ `PushNotificationHooks` |
| Firebase deps / google-services.json | ❌ not added (by design) |

## Changed files

### Backend

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Added `DeviceRole` enum; `user_devices.role` |
| `backend/prisma/migrations/20250608120000_user_devices_role/migration.sql` | New migration |
| `backend/.env.example` | `PUSH_PROVIDER=noop` documented |
| `backend/src/modules/notifications/push/push-provider.interface.ts` | `sendToUser`, `sendToMany`, `PushDeviceRole` |
| `backend/src/modules/notifications/push/base-push.provider.ts` | **New** — shared token lookup |
| `backend/src/modules/notifications/push/noop-push.provider.ts` | Uses base provider |
| `backend/src/modules/notifications/push/firebase-push.provider.ts` | **Stub** — no `firebase-admin` send |
| `backend/src/modules/notifications/push/firebase-push.provider.live.ts` | **New** — reference placeholder |
| `backend/src/modules/notifications/push/apple-push.provider.ts` | Stub via base provider |
| `backend/src/modules/notifications/push/push-delivery.service.ts` | Role-aware register + provider dispatch |
| `backend/src/modules/notifications/push/push-notification.hooks.ts` | **New** — domain event hooks |
| `backend/src/modules/notifications/notifications.module.ts` | Provider factory: explicit `noop` default |
| `backend/src/modules/notifications/notifications.service.ts` | Optional `userRole` for courier targeting |
| `backend/src/modules/notifications/notifications.controller.ts` | `POST .../devices/register` alias; `role=CUSTOMER` |
| `backend/src/modules/notifications/staff-notifications.controller.ts` | `/register` alias; role from JWT |
| `backend/src/modules/couriers/couriers.controller.ts` | Courier device register/unregister |

### Customer mobile

| File | Change |
|------|--------|
| `apps/customer_mobile/lib/core/constants/api_paths.dart` | Primary path `/notifications/devices/register` |

*(Existing stub push module unchanged except API path.)*

### Courier mobile

| File | Change |
|------|--------|
| `apps/courier_mobile/pubspec.yaml` | Added `uuid` (device id only) |
| `apps/courier_mobile/lib/app.dart` | `PushBootstrap` wrapper |
| `apps/courier_mobile/lib/core/constants/api_paths.dart` | Courier device paths |
| `apps/courier_mobile/lib/core/push/*` | **New** stub push + registration |
| `apps/courier_mobile/lib/features/notifications/data/device_registration_repository.dart` | **New** |
| `apps/courier_mobile/lib/features/auth/data/auth_repository.dart` | Register on login, unregister on logout |

### Documentation

| File | Change |
|------|--------|
| `FCM_PREPARATION.md` | **New** — architecture & future steps |

## New APIs

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/v1/notifications/devices/register` | Customer JWT | `{ deviceId, platform, pushToken? }` |
| POST | `/api/v1/notifications/devices/unregister` | Customer JWT | `{ deviceId, platform }` |
| POST | `/api/v1/notifications/devices` | Customer JWT | *(legacy alias for register)* |
| POST | `/api/v1/notifications/staff/devices/register` | Staff JWT | same |
| POST | `/api/v1/couriers/devices/register` | Courier JWT | same |
| POST | `/api/v1/couriers/devices/unregister` | Courier JWT | `{ deviceId, platform }` |

## New / updated tables

### `user_devices` (existing table + column)

| Column | Notes |
|--------|-------|
| `role` | **NEW** — `CUSTOMER` \| `COURIER` \| `STAFF` |

Migration backfills: `CUSTOMER` rows → `CUSTOMER`, `STAFF` rows → `STAFF`. Courier app sets `COURIER` on register.

## Event hooks (`PushNotificationHooks`)

| Hook | Intended event |
|------|----------------|
| `customerOrderAssigned` | Customer — order accepted |
| `customerOrderPickedUp` | Customer — picked up / delivering |
| `customerOrderDelivered` | Customer — completed |
| `courierNewOrderAssigned` | Courier — new assignment |
| `courierOrderCancelled` | Courier — order cancelled |
| `managerCourierDeclined` | Manager — courier declined |

Hooks delegate to `NotificationService` (in-app + noop push). Wire from domain services incrementally.

## Configuration

```env
PUSH_PROVIDER=noop   # default, required for current deployments
# PUSH_PROVIDER=firebase   # future
```

## Future Firebase checklist

### Backend
- [ ] Apply migration `20250608120000_user_devices_role` on production
- [ ] Set `PUSH_PROVIDER=firebase`
- [ ] Add `FIREBASE_PROJECT_ID` + `FIREBASE_SERVICE_ACCOUNT_JSON`
- [ ] Implement live send in `firebase-push.provider.ts` (see `.live.ts` reference)

### Customer APK
- [ ] `firebase_core`, `firebase_messaging`, `flutter_local_notifications` in pubspec
- [ ] `android/app/google-services.json`
- [ ] Google Services Gradle plugin
- [ ] Enable dormant module under `lib/core/push/_firebase_dormant/`
- [ ] Notification channel `foodapp_default`

### Courier APK
- [ ] Same Firebase setup as customer
- [ ] Replace `PushNotificationServiceStub`
- [ ] Rebuild APK — `DeviceRegistrationService` will send real tokens

### Verify
- [ ] Login → `user_devices` row with non-null `push_token`
- [ ] Order event → FCM received on device
- [ ] Logout → token cleared

## Build verification

- `backend`: `npm run build` ✅
- No new Firebase packages on mobile
- No `google-services.json` required
- Existing customer/courier CI workflows unchanged

## Not committed

Per request, changes are **local only** — run `git status` to review before commit.
