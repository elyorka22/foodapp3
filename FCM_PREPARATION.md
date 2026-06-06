# FCM Preparation — FoodApp Push Architecture

This document describes the **prepared** push notification architecture. Firebase is **not enabled** yet — the system runs with `PUSH_PROVIDER=noop` and mobile stub transport.

## Goals

- Single FoodApp-owned notification pipeline (templates, in-app history, WebSocket)
- Pluggable push **transport** (FCM later) without changing domain logic
- Device registration for customer and courier apps before FCM tokens exist
- Zero breaking changes when Firebase is added later

## Architecture

```
┌─────────────────────┐     ┌──────────────────────────┐
│ Order / Courier     │     │ PushNotificationHooks    │
│ domain services     │────▶│ (event entry points)     │
└─────────────────────┘     └────────────┬─────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ NotificationService   │
                              │ • template + DB row   │
                              │ • WebSocket emit      │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ PushDeliveryService   │
                              │ • device registry     │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ PushProvider          │
                              │ • sendToUser()        │
                              │ • sendToMany()        │
                              └──────────┬──────────┘
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            NoopPushProvider    FirebasePushProvider   ApplePushProvider
            (default, active)   (stub, logs only)      (stub, logs only)
```

## Provider pattern

| Provider | When | Behavior |
|----------|------|----------|
| `noop` | **Default** (`PUSH_PROVIDER=noop`) | Logs would-be push; no external calls |
| `firebase` | Future (`PUSH_PROVIDER=firebase`) | Stub today; replace with live FCM in `firebase-push.provider.ts` |
| `apns` | Future native iOS | Stub only |

**Important:** FoodApp logic (templates, preferences, deep-link metadata) stays in `NotificationService`. Providers only deliver `{ title, body, data }` to device tokens.

## Database — `user_devices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Customer or staff user id |
| `account_type` | CUSTOMER \| STAFF | Legacy partition for unique constraint |
| `role` | CUSTOMER \| COURIER \| STAFF | FCM targeting role |
| `device_id` | string | Stable per-install UUID from mobile |
| `platform` | android \| ios \| web | |
| `push_token` | string? | **Nullable** until FCM enabled |
| `created_at` / `updated_at` | timestamp | |

Unique: `(user_id, account_type, device_id)`

## Registration flow

### Customer mobile / web

1. App generates persistent `deviceId` (UUID in SharedPreferences)
2. On login → `POST /api/v1/notifications/devices/register`
3. Body: `{ deviceId, platform, pushToken? }` — `pushToken` null with stub
4. On logout → `POST /api/v1/notifications/devices/unregister`

### Courier mobile

1. Same UUID `deviceId` pattern
2. On login → `POST /api/v1/couriers/devices/register`
3. On logout → `POST /api/v1/couriers/devices/unregister`
4. Stored with `role=COURIER`

### Staff web / admin

- Existing `POST /api/v1/notifications/staff/devices` (+ `/register` alias)
- `role=STAFF` (or `COURIER` when staff JWT role is courier)

## Event hooks (prepared)

`PushNotificationHooks` centralizes domain events. Hooks create in-app notifications; push transport is noop until FCM.

| Event | Hook | Audience |
|-------|------|----------|
| Order accepted / assigned | `customerOrderAssigned` | Customer |
| Order picked up | `customerOrderPickedUp` | Customer |
| Order delivered | `customerOrderDelivered` | Customer |
| New assignment | `courierNewOrderAssigned` | Courier |
| Order cancelled | `courierOrderCancelled` | Courier |
| Courier declined | `managerCourierDeclined` | Managers |

## Configuration

```env
# Default — safe for all environments
PUSH_PROVIDER=noop

# Future Firebase (not required yet)
# PUSH_PROVIDER=firebase
# FIREBASE_PROJECT_ID=
# FIREBASE_SERVICE_ACCOUNT_JSON=
```

## Future Firebase steps

### Backend

1. Set `PUSH_PROVIDER=firebase`
2. Add Firebase Admin credentials to env
3. Move live send logic from `firebase-push.provider.live.ts` into `firebase-push.provider.ts`
4. Run migration if not applied: `user_devices.role`

### Customer mobile (`apps/customer_mobile`)

1. Add to `pubspec.yaml`: `firebase_core`, `firebase_messaging`, `flutter_local_notifications`
2. Add `android/app/google-services.json` (from Firebase console)
3. Enable Gradle Google Services plugin
4. Restore implementation from `lib/core/push/_firebase_dormant/`
5. Switch `push_providers.dart` from stub → Firebase service
6. Create Android notification channel `foodapp_default`

### Courier mobile (`apps/courier_mobile`)

1. Same Firebase deps + `google-services.json`
2. Replace `PushNotificationServiceStub` with Firebase implementation
3. No code changes to `DeviceRegistrationService` — it already sends `pushToken` when available

### Bot / domain (Telegram-style checklist)

- [ ] Firebase project created
- [ ] Android apps registered (customer + courier package names)
- [ ] iOS apps + APNs key (later)
- [ ] Service account JSON on backend
- [ ] Test device receives FCM after login

## Required files later (not in repo yet)

| File | App |
|------|-----|
| `android/app/google-services.json` | customer_mobile, courier_mobile |
| `ios/Runner/GoogleService-Info.plist` | iOS builds |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | backend env |
| Firebase console FCM API enabled | project |

## What works today without Firebase

- In-app notification center (HTTP + WebSocket on web)
- Device rows in `user_devices` with null `push_token`
- Login/logout register & unregister
- Noop push logging on backend
- All existing builds and CI unchanged
