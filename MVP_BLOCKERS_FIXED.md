# MVP Launch Blockers — Fixed

**Date:** 2026-06-05  
**Scope:** Launch blocker fixes only (no new features, no UI redesign)  
**Reference:** `MVP_AUDIT_REPORT.md`

---

## Summary

| Blocker | Status | Fix |
|---------|--------|-----|
| B1 Customer mobile checkout quote | ✅ Fixed | `perKmFee` aligned with API |
| B2 Courier active order visibility | ✅ Fixed | `ARRIVED_AT_RESTAURANT` in `isActive` |
| B3 Decline flow consistency | ✅ Fixed | Option A: decline on assigned orders only |
| B4 Database migration | ⚠️ Pending deploy | DB unreachable in fix environment |
| B5 Remove courier safety | ✅ Fixed | Status guard on `removeCourier` |
| Additional: Web tracking fields | ✅ Fixed | Courier, fee, distance on `/track/[token]` |

---

## Files changed

### Backend
| File | Change |
|------|--------|
| `backend/src/modules/orders/orders.service.ts` | `removeCourier` limited to `PREPARING` / `COURIER_ASSIGNED`; self-accept sets `assignment.acceptedAt` |

### Customer mobile
| File | Change |
|------|--------|
| `apps/customer_mobile/lib/features/checkout/data/orders_repository.dart` | `DeliveryQuoteModel` uses `perKmFee` (fallback `pricePerKm`) |

### Courier mobile
| File | Change |
|------|--------|
| `apps/courier_mobile/lib/shared/models/courier_order_model.dart` | `ARRIVED_AT_RESTAURANT` in `isActive`; `assignmentAcceptedAt`; `needsCourierAcceptance` |
| `apps/courier_mobile/lib/features/orders/presentation/incoming_order_screen.dart` | Removed decline (pool accept-only) |
| `apps/courier_mobile/lib/features/orders/presentation/active_order_screen.dart` | Accept/decline for manager-assigned orders |

### Frontend
| File | Change |
|------|--------|
| `frontend/src/app/track/[token]/page.tsx` | Display courier name/phone, delivery fee, distance, subtotal breakdown |

---

## APIs changed

No new endpoints. Behavior changes:

| Endpoint | Change |
|----------|--------|
| `PATCH /orders/:id/remove-courier` | Returns `400` if status is `ARRIVED_AT_RESTAURANT`, `PICKED_UP`, `DELIVERING`, or `DELIVERED` |
| `POST /orders/:id/accept` (pool self-accept) | Sets `courier_assignments.accepted_at` immediately |
| `POST /orders/:id/assign-courier` (manager) | Leaves `accepted_at` null until courier accepts |

---

## Blocker details

### B1 — Customer mobile checkout

**Before:** `DeliveryQuoteModel.fromJson` required `pricePerKm`; API returns `perKmFee` → parse crash after GPS.

**After:**
```dart
perKmFee: (json['perKmFee'] ?? json['pricePerKm']) as num?,
```

**Expected flow:** GPS → quote loads → Products + Delivery + Total visible on checkout screen.

---

### B2 — Courier active order

**Before:** `isActive` omitted `ARRIVED_AT_RESTAURANT` → home screen empty mid-delivery.

**After:** Active statuses:
- `COURIER_ASSIGNED`
- `ARRIVED_AT_RESTAURANT`
- `PICKED_UP`
- `DELIVERING`

---

### B3 — Decline flow (Option A)

**Before:** Incoming screen showed pool orders + decline button; API required assigned order → always failed.

**After:**

| Flow | UI | API |
|------|-----|-----|
| Pool order (unassigned) | Incoming: **Accept only** | `POST /orders/:id/accept` |
| Manager assigns courier | Home → Active order: **Accept / Decline** | `POST /accept` or `POST /couriers/orders/:id/decline` |
| After courier accepts | Active order: delivery steps | Status PATCH |

**Detection:** `needsCourierAcceptance` = `COURIER_ASSIGNED` && `assignment.acceptedAt == null`.

Manager assign leaves `acceptedAt` null. Pool self-accept sets `acceptedAt` on assignment create.

---

### B4 — Database migration verification

**Migration:** `backend/prisma/migrations/20250613000000_delivery_mvp/migration.sql`

**Deploy attempt:** `npx prisma migrate deploy` → **failed** (`P1001: Can't reach database server at localhost:5432`)

PostgreSQL was not running in the fix environment. Migration file and schema are aligned; deploy must be run where the database is available.

#### Deploy command (run before launch)

```bash
cd backend && npx prisma migrate deploy
```

#### Verification SQL (run after deploy)

```sql
-- 1. Enum: ARRIVED_AT_RESTAURANT
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'OrderStatus'
ORDER BY e.enumsortorder;

-- 2. Admin notification types
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'AdminNotificationType'
ORDER BY e.enumsortorder;

-- 3. courier_locations table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'courier_locations';

-- 4. Existing orders unaffected (no column changes on orders)
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

#### Expected results

| Check | Expected |
|-------|----------|
| `OrderStatus` enum | Contains `ARRIVED_AT_RESTAURANT` |
| `AdminNotificationType` enum | Contains `COURIER_DECLINED`, `ORDER_DELIVERED` |
| `courier_locations` | Table exists with `courier_id`, `latitude`, `longitude`, `updated_at` |
| Existing orders | No migration modifies order rows; all statuses remain valid |

#### Schema alignment

| Migration | `schema.prisma` |
|-----------|-----------------|
| `ARRIVED_AT_RESTAURANT` | ✅ `OrderStatus` line 22 |
| `COURIER_DECLINED`, `ORDER_DELIVERED` | ✅ `AdminNotificationType` lines 104–105 |
| `courier_locations` table | ✅ `CourierLocation` model lines 285–296 |

**Migration verification status:** ⚠️ **Not executed** — requires running database. **Launch blocker until `migrate deploy` succeeds in target environment.**

---

### B5 — Remove courier safety

**Before:** Manager could remove courier during `PICKED_UP` / `DELIVERING` → order reset to `PREPARING`.

**After:** `removeCourier` only allowed when status ∈ `{ PREPARING, COURIER_ASSIGNED }`.

**Error response:**
```
400 Bad Request: Cannot remove courier while order is DELIVERING
```

---

### Additional — Web tracking

**Before:** `/track/[token]` showed status + total only.

**After:** Shows courier name, phone, delivery fee, distance, subtotal + delivery + total breakdown. WebSocket updates preserve full payload shape.

---

## Test results

| Test | Result | Notes |
|------|--------|-------|
| Backend `npm run build` | ✅ Pass | |
| Frontend `npm run build` | ✅ Pass | |
| `npx prisma migrate deploy` | ❌ DB unreachable | Run when PostgreSQL is up |
| Flutter analyze | ⏭️ Skipped | Flutter CLI not available |
| Manual E2E | ⏭️ Pending | Requires running stack + migration |

### Manual test checklist (post-migration)

- [ ] Mobile checkout: GPS → delivery quote → totals visible
- [ ] Courier home: active order visible through `ARRIVED_AT_RESTAURANT`
- [ ] Manager assigns → courier sees Accept/Decline on active order
- [ ] Courier declines → order returns to manager queue
- [ ] Pool incoming: Accept only (no decline button)
- [ ] Manager cannot remove courier during `DELIVERING`
- [ ] Web `/track/:token` shows courier, fee, distance

---

## Remaining high-priority issues (not launch blockers)

From `MVP_AUDIT_REPORT.md` — still open:

1. **H1** — `PATCH /status` → `COURIER_ASSIGNED` without `courierId` creates orphan status
2. **H2** — Courier can cancel assigned orders via status PATCH
3. **H4** — `assignCourier` missing `emitBusinessOrder`
4. **H5** — Decline WebSocket payload not using full `serializeOrder`
5. **H6** — Duplicate `ORDER_DELIVERING` customer notifications
6. **H7** — `ARRIVED_AT_RESTAURANT` maps to wrong customer notification template
7. **H8** — Inactive couriers can be assigned
8. **H9/H10** — `CourierAssignment` timestamps and courier stats never updated on delivery

---

*No git commit made per request.*
