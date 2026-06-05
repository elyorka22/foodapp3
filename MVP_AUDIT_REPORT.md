# MVP Audit Report

**Date:** 2026-06-05  
**Scope:** `backend/`, `frontend/`, `apps/customer_mobile/`, `apps/courier_mobile/`  
**Type:** Read-only audit — no code changes, no commits  
**Reference docs:** `ORDER_LIFECYCLE.md`, `DELIVERY_PRICING.md`, `MVP_DELIVERY_REPORT.md`

---

## Executive summary

The delivery MVP is **partially production-ready**. Core backend architecture (status flow, pricing formula, frozen order snapshots, assign/reassign/remove APIs, decline endpoint, courier location history) is in place and builds successfully. However, **three client-side defects block reliable end-to-end delivery**, and **two backend guards allow data corruption or invalid states**.

| Area | Status |
|------|--------|
| Order lifecycle (backend) | ⚠️ Mostly complete; guard gaps |
| Order lifecycle (clients) | ❌ Courier mobile breaks mid-flow |
| Delivery fee calculation | ✅ Backend + web OK; ❌ mobile parse bug |
| Restaurant coordinates | ✅ Admin create/edit; ⚠️ optional on create |
| Courier assignment | ✅ APIs + admin UI wired |
| Courier decline | ❌ UI/API mismatch on pool orders |
| Notifications | ⚠️ Work but wrong/duplicate templates |
| Tracking screens | ⚠️ Mobile OK; web incomplete |
| Role permissions | ⚠️ BUSINESS too broad; MANAGER no pricing |
| API consistency | ⚠️ Decline WS payload diverges |
| Database migrations | ⚠️ File exists; deploy unverified |

**Verdict:** Do **not** launch to production until launch blockers below are resolved and migration `20250613000000_delivery_mvp` is confirmed applied.

---

## Verification by area

### 1. Customer → Manager → Courier → Customer lifecycle

**Backend `STATUS_FLOW`** (`orders.service.ts:34–44`) matches spec:

```
PENDING → ACCEPTED → PREPARING → COURIER_ASSIGNED → ARRIVED_AT_RESTAURANT → PICKED_UP → DELIVERING → DELIVERED
```

| Step | Backend | Web admin | Web courier | Customer mobile | Courier mobile |
|------|---------|-----------|-------------|-----------------|----------------|
| Place order | ✅ `POST /orders/guest` | — | — | ⚠️ quote bug | — |
| Manager accepts/prepares | ✅ `PATCH /status` | ✅ quick actions | — | — | — |
| Manager assigns courier | ✅ `POST /assign-courier` | ✅ order drawer | — | — | — |
| Courier accepts | ✅ `POST /accept` | — | ✅ | — | ✅ |
| Courier decline | ⚠️ assigned only | — | — | — | ❌ wrong context |
| Arrived at restaurant | ✅ enum + flow | ✅ | ✅ | ✅ status steps | ✅ API call |
| Picked up / delivering | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delivered | ✅ + loyalty | ✅ | ✅ | ✅ terminal poll | ✅ |
| Customer tracking | ✅ track API | ❌ minimal UI | — | ✅ polling 5s | — |

**Gap:** Courier mobile `CourierOrderModel.isActive` omits `ARRIVED_AT_RESTAURANT` (`courier_order_model.dart:76–81`). After “arrived at restaurant”, home screen shows **no active order** while delivery is still in progress.

---

### 2. Delivery fee calculation accuracy

**Formula (verified in code):**

```
straightLineKm = Haversine(restaurant, customer)
distanceKm = straightLineKm × 1.3
rawFee = baseDeliveryFee + (distanceKm × perKmFee)
deliveryFee = roundToNearest500(rawFee)
```

| Check | Result |
|-------|--------|
| `delivery-fee.calculator.ts` | ✅ Factor 1.3, round 500 |
| Defaults 8000 / 1500 / 10 km | ✅ `settings.service.ts:49–55` |
| Max distance rejection | ✅ `delivery-pricing.service.ts:36–40` |
| Order freeze at creation | ✅ `orders.service.ts:197–205` |
| Web checkout auto-quote | ✅ `checkout/page.tsx` debounced |
| Mobile checkout quote | ❌ expects `pricePerKm`, API returns `perKmFee` |
| `free_delivery_threshold` | ❌ Not applied in pricing |
| Courier payout formula | ⚠️ Different (`geo.util` min fee, no base) |
| Unit tests | ❌ None for delivery calculator |

**Example (1 km straight):** 1.3 km × 1500 + 8000 = 9950 → **10 000 UZS** ✅

---

### 3. Restaurant coordinates

| Check | Result |
|-------|--------|
| Storage on `BusinessBranch` | ✅ Required in schema |
| Admin create/edit (restaurants + stores) | ✅ `MerchantLocationFields` + map picker |
| Admin detail display | ✅ `restaurants/[id]/page.tsx` read-only |
| API via `/businesses` | ✅ `business.mapper.ts` |
| Legacy `GET /restaurants` flat coords | ❌ Missing |
| Create without coords allowed | ⚠️ `upsertPrimaryBranch` skips if null |
| Quote/checkout error message | ✅ Clear `BadRequestException` |

---

### 4. Courier assignment

| Endpoint | Roles | Wired in admin UI |
|----------|-------|-------------------|
| `POST /orders/:id/assign-courier` | MANAGER, SUPER_ADMIN | ✅ |
| `PATCH /orders/:id/reassign-courier` | MANAGER, SUPER_ADMIN | ✅ |
| `PATCH /orders/:id/remove-courier` | MANAGER, SUPER_ADMIN | ✅ |

| Check | Result |
|-------|--------|
| Online status in courier list | ✅ |
| Active order count in list | ✅ via `stats.activeOrders` |
| Manager can assign offline courier | ✅ By design |
| Inactive user assignable | ❌ No `user.isActive` check |
| Reassign after `ARRIVED_AT_RESTAURANT` | ❌ Blocked (status guard) |
| `emitBusinessOrder` on assign | ❌ Missing |

---

### 5. Courier decline flow

**Backend** (`couriers.service.ts:391–477`):
- Requires `courierId === courier.id` AND `status === COURIER_ASSIGNED`
- Reverts to `PREPARING`, notifies manager (admin + staff `ORDER_PROBLEM`)

**Courier mobile incoming screen** (`incoming_order_screen.dart`):
- Loads orders from `GET /couriers/me/orders/available` → **`courierId: null`** pool orders
- Decline calls `POST /couriers/orders/:id/decline` → **always fails** for pool orders

**Manager-assigned orders** (`courierId` set) do not appear in available list; courier sees them via `activeOrderProvider` / notifications, but **decline is not offered on active order screen**.

**Conclusion:** Decline works only for manager-pre-assigned orders if courier navigates there manually; incoming-screen decline is **non-functional** for the primary pool-accept flow.

---

### 6. Notification delivery

Templates exist in DB (`20250607000000_notification_system`).

| Event | Customer | Manager (staff inbox) | Manager (admin bell) | Courier |
|-------|----------|----------------------|----------------------|---------|
| Order placed | ✅ ORDER_CREATED | ✅ NEW_ORDER | ✅ NEW_ORDER | — |
| Courier assigned | ⚠️ ORDER_READY (wrong copy) | — | — | ✅ ORDER_ASSIGNED |
| Arrived at restaurant | ⚠️ ORDER_PREPARING (wrong) | — | — | — |
| Picked up | ✅ ORDER_DELIVERING | — | — | — |
| Delivering | ⚠️ Duplicate ORDER_DELIVERING | — | — | — |
| Delivered | ✅ ORDER_COMPLETED | ❌ Not in staff inbox | ✅ ORDER_DELIVERED | — |
| Courier declined | — | ✅ ORDER_PROBLEM | ✅ COURIER_DECLINED | — |

Push/FCM not audited at runtime; in-app notification records are created server-side.

---

### 7. Tracking screens

| Platform | Status | Courier info | Fee | Distance | Live updates |
|----------|--------|--------------|-----|----------|--------------|
| Customer mobile | ✅ | ✅ name/phone | ✅ | ✅ | ✅ 5s poll |
| Web `/track/[token]` | ⚠️ | ❌ | ❌ | ❌ | ✅ WebSocket |
| Courier active screen | ✅ | — | — | — | ❌ load once |
| Admin order drawer | ✅ | ✅ | ✅ | ✅ | 15s list refetch |

API `GET /orders/track/:token` returns full `serializeOrder` including courier; web page type omits fields.

---

### 8. Role permissions

| Role | Orders | Assign courier | Status PATCH | Delivery settings | Decline |
|------|--------|----------------|--------------|-------------------|---------|
| SUPER_ADMIN | ✅ | ✅ | ✅ all | ✅ PUT pricing | — |
| MANAGER | ✅ | ✅ | ✅ all | ❌ No `settings` perm | — |
| BUSINESS | Own orders | ❌ | ⚠️ Including CANCELLED, COURIER_ASSIGNED | ❌ | — |
| COURIER | Assigned only | ❌ | ⚠️ Can CANCEL assigned orders | ❌ | ✅ |
| Public | track + quote + guest order | — | — | — | — |

---

### 9. API consistency

| Issue | Severity |
|-------|----------|
| Quote response: `perKmFee` (backend) vs `pricePerKm` (mobile) | Critical |
| Decline WS payload hand-built vs `serializeOrder` | High |
| `serializeOrder` uses `restaurant` key for `business` relation | Low (consistent) |
| Duplicate `PATCH /couriers/location` and `/me/location` | Low |
| `GET /orders/track/:token` missing `address` include vs `findOne` | Medium |

---

### 10. Database migrations

| Migration | Purpose | Schema alignment |
|-----------|---------|------------------|
| `20250612000000_order_delivery_snapshot` | Frozen delivery coords on orders | ✅ |
| `20250613000000_delivery_mvp` | `ARRIVED_AT_RESTAURANT`, admin enum values, `courier_locations` | ✅ Matches `schema.prisma` |

**Deploy status:** Could not verify (`prisma migrate status` — DB unreachable in audit environment). **Must run** `npx prisma migrate deploy` before any environment using `ARRIVED_AT_RESTAURANT` or decline admin types.

`docker-entrypoint.sh` runs `migrate deploy` on container start ✅.

---

## Launch blockers

These must be fixed before production launch:

1. **Customer mobile checkout quote crash** — `DeliveryQuoteModel` requires `pricePerKm`; API returns `perKmFee` (`orders_repository.dart:30`). Mobile orders cannot complete delivery fee step.

2. **Courier loses active order at `ARRIVED_AT_RESTAURANT`** — `isActive` getter missing status (`courier_order_model.dart:76–81`). Courier cannot return to active delivery from home.

3. **Decline broken on incoming order screen** — UI targets pool orders (`courierId: null`); API requires assigned order (`couriers.service.ts:398–408`). Decline button errors for normal flow.

4. **Migration `20250613000000_delivery_mvp` must be applied** — Without it, status `ARRIVED_AT_RESTAURANT` and `courier_locations` table do not exist; courier flow will 500.

5. **`removeCourier` can corrupt in-flight deliveries** — No status guard (`orders.service.ts:571–588`). Manager can reset `PICKED_UP`/`DELIVERING` orders to `PREPARING`.

---

## Critical issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| C1 | Mobile delivery quote JSON field mismatch | `apps/customer_mobile/.../orders_repository.dart:30` | Mobile checkout broken |
| C2 | `isActive` omits `ARRIVED_AT_RESTAURANT` | `apps/courier_mobile/.../courier_order_model.dart:76–81` | Courier stranded mid-delivery |
| C3 | Decline API/UI context mismatch | `incoming_order_screen.dart` + `couriers.service.ts:398–408` | Decline feature non-functional in primary UI |
| C4 | `removeCourier` no status guard | `orders.service.ts:571–588` | Data corruption / wrong customer state |
| C5 | Migration deploy unverified | `20250613000000_delivery_mvp` | Runtime failures on new statuses/table |

---

## High priority issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| H1 | `PATCH /status` → `COURIER_ASSIGNED` without `courierId` sets orphan status | `orders.service.ts:437–463` | Invalid orders in pool |
| H2 | Courier can `CANCEL` assigned orders | `STATUS_FLOW` + `assertCanUpdateOrder:771–776` | Orders cancelled without manager |
| H3 | Web track page ignores courier/fee/distance from API | `frontend/src/app/track/[token]/page.tsx:12–17` | Web customers miss MVP tracking info |
| H4 | `assignCourier` missing `emitBusinessOrder` | `orders.service.ts:724–725` | Restaurant dashboard stale on assign |
| H5 | Decline WS payload inconsistent with `serializeOrder` | `couriers.service.ts:458–470` | WS clients get partial order shape |
| H6 | Duplicate `ORDER_DELIVERING` customer notifications | `order-status-notification.map.ts:12–13` | Customer spam on PICKED_UP + DELIVERING |
| H7 | `ARRIVED_AT_RESTAURANT` → `ORDER_PREPARING` notification | `order-status-notification.map.ts:11` | Wrong customer message |
| H8 | Inactive couriers can be assigned | `orders.service.ts:654–660` | Blocked users receive orders |
| H9 | `CourierAssignment.pickedUpAt`/`deliveredAt` never set | Schema + no writes | Courier avg delivery time always 0 |
| H10 | `courier.totalDeliveries`/`totalEarnings` never updated | No writes on DELIVERED | Stale courier stats |

---

## Medium priority issues

| # | Issue | Location |
|---|-------|----------|
| M1 | MANAGER cannot edit delivery pricing (no `settings` permission) | `admin-permissions.ts:25–41` |
| M2 | Restaurant detail: coords read-only (edit only on list modal) | `restaurants/[id]/page.tsx` |
| M3 | Mobile checkout: no auto-quote on GPS (unlike web) | `checkout_screen.dart` |
| M4 | Customer mobile: `pollError` not displayed on tracking | `order_tracking_screen.dart` |
| M5 | Admin drawer quick status actions don't refresh | `order-drawer.tsx` + `admin-orders-view.tsx` |
| M6 | Admin `StatusBadge` shows raw enum strings | `components/admin/ui.tsx` |
| M7 | Courier active order screen: no poll/socket refresh | `active_order_screen.dart` |
| M8 | Courier `PICKED_UP` button label says "Delivered" | `active_order_screen.dart:67` |
| M9 | `free_delivery_threshold` setting unused | `settings.service.ts` |
| M10 | Legacy `GET /restaurants` missing flat lat/lng | `restaurants.service.ts` public serializers |
| M11 | Restaurant create allows missing coordinates | `upsertPrimaryBranch:607` |
| M12 | `getAvailableOrders` includes `COURIER_ASSIGNED` | Masks orphan status states |
| M13 | No delivery fee unit tests | — |
| M14 | `courier_locations` unbounded growth | Every location PATCH inserts |
| M15 | Location PATCH lacks validation DTO | `couriers.controller.ts:88–96` |
| M16 | Reassign/remove hidden in admin after `ARRIVED_AT_RESTAURANT` | `order-drawer.tsx:88–90` (matches backend) |
| M17 | Web courier page status buttons on unavailable list | `courier/page.tsx:166–188` |
| M18 | Manager delivered alert only in admin-notifications, not staff inbox | By design but confusing |
| M19 | No customer notification on decline/remove/reassign | — |
| M20 | Realtime socket stub in courier mobile | `orders_socket_service.dart` |

---

## What works well

- Backend delivery formula, defaults, max-distance check, and frozen order snapshot
- Web checkout instant delivery quote and totals breakdown
- Admin courier assign / reassign / remove wired to correct REST endpoints
- Admin map picker + coordinate save on restaurant/store forms
- Customer mobile tracking with courier, fee, distance, and 5s polling
- Courier mobile status transitions align with backend `STATUS_FLOW` (except `isActive`)
- Courier `api_paths.dart` matches backend routes
- Notification templates seeded; core events fire server-side
- Prisma schema and migration `20250613000000_delivery_mvp` are aligned
- Backend and frontend production builds pass

---

## Recommended fixes

### Immediate (launch blockers)

1. **Mobile quote parse** — Change `DeliveryQuoteModel.fromJson` to use `json['perKmFee'] ?? json['pricePerKm']`, make field optional if unused.
2. **Courier `isActive`** — Add `status == 'ARRIVED_AT_RESTAURANT'` to getter.
3. **Decline flow** — Either:
   - (A) Add `POST /couriers/orders/:id/skip` for pool orders (dismiss without assignment), or
   - (B) Move decline to active-order screen for manager-assigned orders and remove decline from incoming pool UI, or
   - (C) Change decline to work on `PREPARING` pool orders without prior assignment.
4. **Deploy migration** — Run `npx prisma migrate deploy` on all environments; verify `ARRIVED_AT_RESTAURANT` in `OrderStatus` enum.
5. **`removeCourier` guard** — Only allow when status ∈ `{PREPARING, COURIER_ASSIGNED}`.

### Short-term (high priority)

6. Reject `PATCH /status` → `COURIER_ASSIGNED` when `courierId` is missing.
7. Restrict courier `CANCELLED` transitions (manager/admin only).
8. Extend web `track/[token]/page.tsx` to show courier, phone, delivery fee, distance (API already provides).
9. Add `emitBusinessOrder` to `assignCourier` return path.
10. Use `serializeOrder` in decline WebSocket payload.
11. Fix notification map: remove duplicate `DELIVERING`; map `ARRIVED_AT_RESTAURANT` to appropriate template or none.
12. Check `user.isActive` in `assignCourier`.
13. Write `pickedUpAt`/`deliveredAt` on assignment when statuses change; increment courier stats on `DELIVERED`.

### Medium-term

14. Grant MANAGER read/write on delivery pricing (or dedicated `delivery-settings` permission).
15. Add coordinate edit on restaurant detail page.
16. Auto-quote on mobile checkout when GPS resolves (parity with web).
17. Poll or socket on courier active-order screen.
18. Add delivery fee unit tests with documented examples (8000 + 1.3km × 1500).
19. Apply `free_delivery_threshold` or remove unused setting.
20. Wire courier realtime socket (`orders_socket_service.dart`).

---

## Pre-launch test checklist

### Environment
- [ ] `npx prisma migrate deploy` succeeded
- [ ] `ARRIVED_AT_RESTAURANT` exists in DB enum
- [ ] `courier_locations` table exists
- [ ] Delivery pricing settings configured (8000 / 1500 / 10)

### Happy path (manual E2E)
- [ ] Restaurant has coordinates (map picker)
- [ ] Web checkout: GPS → fee → place order
- [ ] **Mobile checkout: GPS → fee → place order** (currently fails)
- [ ] Manager assigns courier from order drawer
- [ ] Courier accepts → arrived → picked up → delivered
- [ ] **Courier home shows active order through entire flow** (breaks at arrived)
- [ ] Customer mobile tracking shows courier + fee + distance
- [ ] Web tracking shows same fields (currently missing)
- [ ] Manager notified on decline (test via manager-assigned decline, not pool incoming)

### Edge cases
- [ ] Order beyond max distance rejected at quote
- [ ] Restaurant without coords rejected at quote with clear error
- [ ] Reassign courier while `COURIER_ASSIGNED`
- [ ] Remove courier only in allowed statuses (after fix)
- [ ] Verify no duplicate delivering notifications to customer

---

## Files audited (key)

**Backend:** `orders.service.ts`, `orders.controller.ts`, `couriers.service.ts`, `couriers.controller.ts`, `delivery-fee.calculator.ts`, `delivery-pricing.service.ts`, `settings.service.ts`, `restaurants.service.ts`, `notifications.service.ts`, `order-status-notification.map.ts`, `schema.prisma`, migrations `20250612000000_*`, `20250613000000_*`

**Frontend:** `checkout/page.tsx`, `track/[token]/page.tsx`, `admin-orders-view.tsx`, `order-drawer.tsx`, `merchant-location-fields.tsx`, `map-location-picker.tsx`, `admin/settings/page.tsx`, `admin-permissions.ts`, `use-admin-orders.ts`, `use-delivery-pricing.ts`

**Customer mobile:** `orders_repository.dart`, `checkout_screen.dart`, `order_tracking_screen.dart`, `order_track_model.dart`, `order_status_steps.dart`, `order_tracking_provider.dart`

**Courier mobile:** `courier_order_model.dart`, `incoming_order_screen.dart`, `active_order_screen.dart`, `courier_repository.dart`, `api_paths.dart`, `courier_home_provider.dart`, `home_screen.dart`

---

*Audit only. No commits made.*
