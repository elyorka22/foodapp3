# Courier app architecture

## Stack

| Layer | Choice |
|-------|--------|
| UI | Flutter Material 3 |
| State | `flutter_riverpod` |
| Routing | `go_router` |
| HTTP | `dio` |
| Session | `flutter_secure_storage` (JWT) + `shared_preferences` |
| Map | `flutter_map` + OpenStreetMap tiles |

## Auth

`POST /auth/login` with phone + password (role `COURIER`).

## Online / location

```
PATCH /couriers/me/online
PATCH /couriers/location   ← canonical (also /couriers/me/location)
{ "latitude": number, "longitude": number }
```

Location updates:

1. `couriers.current_lat/lng` (latest position)
2. `courier_locations` table (history foundation for live tracking)

## Order workflow

### Available orders

```
GET /couriers/me/orders/available
```

Orders in `PREPARING` or `COURIER_ASSIGNED` without courier.

### Accept / decline

```
POST /orders/:id/accept
POST /couriers/orders/:id/decline   { "reason"?: string }
```

Decline returns order to manager queue (`PREPARING`, courier cleared). Manager receives admin + staff notifications.

### Status updates

```
PATCH /orders/:id/status
```

| UI step | Status |
|---------|--------|
| Restoranga yetib bordim | `ARRIVED_AT_RESTAURANT` |
| Buyurtmani oldim | `PICKED_UP` → `DELIVERING` |
| Yetkazildi | `DELIVERED` |

## Manager assignment

Manager can assign/reassign/remove via admin panel:

```
POST /orders/:id/assign-courier
PATCH /orders/:id/reassign-courier
PATCH /orders/:id/remove-courier
```

Courier receives `ORDER_ASSIGNED` staff notification.

## Notifications

Staff notifications: `GET /notifications/staff`

Templates: `ORDER_ASSIGNED`, `ORDER_PROBLEM`, etc.

## Future: live tracking

- `courier_locations` stores position history
- Customer map overlay not implemented (MVP uses status polling only)
