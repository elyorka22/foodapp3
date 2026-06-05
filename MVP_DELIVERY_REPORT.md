# MVP Delivery Report

Delivery MVP implementation: restaurant coordinates, automatic pricing, courier assignment, full order lifecycle, customer tracking, and courier location foundation.

## Changed files

### Backend
- `backend/prisma/schema.prisma` — `ARRIVED_AT_RESTAURANT` status, `CourierLocation` model, admin notification types
- `backend/prisma/migrations/20250613000000_delivery_mvp/migration.sql`
- `backend/src/domain/delivery/delivery-fee.calculator.ts` — formula: base + km × perKm, factor 1.3
- `backend/src/domain/delivery/delivery-pricing.service.ts` — max distance check, new settings keys
- `backend/src/modules/settings/settings.service.ts` — `baseDeliveryFee`, `perKmFee`, `maxDeliveryDistance`
- `backend/src/modules/orders/orders.service.ts` — lifecycle, assign/reassign/remove, courier serialization
- `backend/src/modules/orders/orders.controller.ts` — assign/reassign/remove endpoints
- `backend/src/modules/orders/dto/assign-courier.dto.ts` — new
- `backend/src/modules/couriers/couriers.service.ts` — decline, location history, active status
- `backend/src/modules/couriers/couriers.controller.ts` — `PATCH /couriers/location`, decline endpoint
- `backend/src/modules/couriers/couriers.module.ts` — notifications import
- `backend/src/modules/admin-notifications/admin-notifications.service.ts` — decline + delivered alerts
- `backend/src/modules/notifications/notifications.service.ts` — manager decline notification
- `backend/src/modules/notifications/constants/order-status-notification.map.ts` — new status mappings

### Frontend (admin + web)
- `frontend/src/components/admin/map-location-picker.tsx` — new OSM map picker
- `frontend/src/components/admin/merchant-location-fields.tsx` — map picker integration
- `frontend/src/app/admin/restaurants/[id]/page.tsx` — coordinates display
- `frontend/src/app/admin/settings/page.tsx` — delivery pricing fields
- `frontend/src/hooks/use-delivery-pricing.ts` — updated types
- `frontend/src/hooks/use-admin-orders.ts` — assign/reassign/remove mutations
- `frontend/src/components/admin/order-drawer.tsx` — courier panel with online + active count
- `frontend/src/components/admin/admin-orders-view.tsx` — wired to new APIs
- `frontend/src/app/checkout/page.tsx` — instant delivery quote on GPS change
- `frontend/src/app/courier/page.tsx` — `ARRIVED_AT_RESTAURANT` step
- `frontend/src/components/orders/order-table.tsx` — status flow update
- `frontend/src/lib/uz.ts` — status label

### Customer mobile
- `apps/customer_mobile/lib/shared/models/order_track_model.dart` — courier, distance, fee
- `apps/customer_mobile/lib/features/orders/presentation/order_tracking_screen.dart` — courier info card
- `apps/customer_mobile/lib/core/orders/order_status_steps.dart` — full lifecycle steps
- `apps/customer_mobile/lib/core/l10n/app_strings.dart` — tracking labels

### Courier mobile
- `apps/courier_mobile/lib/core/constants/api_paths.dart` — location + decline paths
- `apps/courier_mobile/lib/features/orders/data/courier_repository.dart` — decline API
- `apps/courier_mobile/lib/features/orders/presentation/incoming_order_screen.dart` — backend decline
- `apps/courier_mobile/lib/features/orders/presentation/active_order_screen.dart` — `ARRIVED_AT_RESTAURANT` via API
- `apps/courier_mobile/COURIER_ARCHITECTURE.md` — updated

### Documentation
- `DELIVERY_PRICING.md` — updated formula and settings
- `ORDER_LIFECYCLE.md` — new
- `MVP_DELIVERY_REPORT.md` — this file

## Database migrations

Run:

```bash
cd backend && npx prisma migrate deploy
```

Migration `20250613000000_delivery_mvp`:

1. `OrderStatus.ARRIVED_AT_RESTAURANT`
2. `AdminNotificationType.COURIER_DECLINED`, `ORDER_DELIVERED`
3. Table `courier_locations` (id, courier_id, latitude, longitude, updated_at)

## New APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/orders/:id/assign-courier` | Manager | Assign courier `{ courierId, note? }` |
| PATCH | `/orders/:id/reassign-courier` | Manager | Reassign courier |
| PATCH | `/orders/:id/remove-courier` | Manager | Remove courier → `PREPARING` |
| POST | `/couriers/orders/:id/decline` | Courier | Decline assigned order `{ reason? }` |
| PATCH | `/couriers/location` | Courier | Save GPS (+ history row) |

Updated behavior:

- `POST /orders/delivery-quote` — new formula, max distance enforcement
- `PATCH /orders/:id/status` — supports `ARRIVED_AT_RESTAURANT`
- `GET /orders/track/:token` — returns courier name/phone, distance, fee

## Testing checklist

### Admin
- [ ] Settings: set baseDeliveryFee=8000, perKmFee=1500, maxDeliveryDistance=10
- [ ] Restaurant edit: manual coords + map picker save
- [ ] Restaurant detail shows coordinates
- [ ] Order drawer: assign courier (online/offline + active count visible)
- [ ] Reassign and remove courier
- [ ] Manager receives notification on courier decline

### Checkout
- [ ] Web: GPS → delivery fee updates automatically (Products / Delivery / Total)
- [ ] Mobile: calculate delivery → fee shown
- [ ] Order beyond 10 km rejected with clear error
- [ ] Created order has frozen coords, distance, fee

### Courier
- [ ] Go online, receive assigned order notification
- [ ] Accept order from pool
- [ ] Decline returns order to manager queue
- [ ] Flow: Arrived → Picked up → Delivered
- [ ] `PATCH /couriers/location` writes to `courier_locations`

### Customer tracking
- [ ] Mobile tracking shows courier name, phone, status, fee, distance
- [ ] Status updates within polling interval (~5s)
- [ ] Web `/track/:token` updates via socket

### Notifications
- [ ] Customer: assigned, picked up, delivered
- [ ] Courier: new assignment
- [ ] Manager: decline, delivered

## Remaining work before production

1. **Live courier map** — `courier_locations` exists; no customer-facing live map yet
2. **Routing API** — still Haversine × 1.3; integrate OSRM/Google for accurate distance
3. **Courier decline UX** — decline only works when order is `COURIER_ASSIGNED` to that courier; manager-assigned orders need in-app decline from active order screen
4. **Push notifications** — in-app notifications work; FCM delivery for background needs device testing
5. **Reassign notification** — old courier not notified on reassign
6. **Free delivery threshold** — setting exists but not applied in new formula
7. **Load testing** — concurrent assignments and location updates
8. **Migration deploy** — run on staging/production before release
9. **Flutter CI** — verify `flutter analyze` on mobile apps in build pipeline
10. **E2E test suite** — automated full lifecycle test (place → assign → deliver)

## Build verification

- Backend: `npm run build` — passed
- Frontend: `npm run build` — passed
- Flutter: not run (flutter CLI unavailable in environment)
