# FoodApp Architecture Audit Report

**Date:** 2026-05-29  
**Scope:** Full-stack marketplace evolution (restaurants → universal local commerce)  
**Auditor role:** Senior software architect review + applied foundation refactor

---

## Executive summary

FoodApp was built as a restaurant delivery product. The codebase had begun a “business types as categories” pattern that **conflated merchant verticals (Restaurant, Grocery, Flowers) with product menu categories (Fruits, Drinks, Toys)**. This audit separates those domains, introduces a **Business domain layer** in Prisma and NestJS, prepares **multi-provider delivery**, and documents a **safe migration path** for API consumers.

**Verdict:** Architecture is now aligned for a city marketplace. Remaining work is mostly **naming cleanup in UI**, **optional DB table renames**, and **deprecation window** for legacy `/restaurants` routes.

---

## 1. Business types vs product categories

### Critical issue (found)

| Problem | Impact |
|--------|--------|
| `GET /categories` (marketplace module) returned **business types** | Mobile/web clients could treat verticals as product categories |
| Admin “Categories” vs “Shop categories” labels overlapped | Operators confused menu categories with marketplace verticals |
| `business_types` used as Do'konlar grid | Correct for discovery, but wrong endpoint name (`/categories`) |

### Correct model (applied)

| Concept | Purpose | Storage | API |
|--------|---------|---------|-----|
| **BusinessType** | What kind of merchant (Restaurant, Grocery, Flowers, …) | `business_types` | `GET /business-types`, `GET /marketplace/business-types` |
| **ProductCategory** | Menu/catalog grouping per merchant (Fruits, Drinks, …) | `categories` (Prisma: `ProductCategory`) | `GET /categories?businessId=`, `GET /marketplace/product-categories?businessId=` |

**Rule:** Businesses → `BusinessType`. Products → `ProductCategory`. Never mix.

### Applied fixes

- Prisma model `Category` renamed to **`ProductCategory`** (`@@map("categories")`).
- Product categories enriched: `description`, `icon`, `image_url` (migration `20250602000000_architecture_foundation`).
- Marketplace controller moved to **`/marketplace`** with explicit routes.
- Categories controller requires **`businessId`** (legacy `restaurantId` alias supported).

---

## 2. Restaurant domain → Business domain

### Critical issues (found)

- Prisma model named `Restaurant` while product goal is universal merchants.
- 70+ backend references to `prisma.restaurant`, `restaurantId`, restaurant-specific DTOs.
- New `BusinessesController` delegated to `RestaurantsService` (alias only, no domain boundary).
- DB table still `restaurants` — acceptable short-term, but code suggested “restaurant-only” product.

### Target architecture

```
┌─────────────────────────────────────────────────────────┐
│  API layer (stable)                                      │
│  GET /businesses  GET /business-types  GET /categories   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  BusinessesService + BusinessRepository (domain)         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Prisma Business model  @@map("restaurants")             │
└─────────────────────────────────────────────────────────┘
```

### Applied fixes

| Layer | Change |
|-------|--------|
| Prisma | `Restaurant` → **`Business`** (`@@map("restaurants")`) |
| Prisma | `RestaurantBranch` → **`BusinessBranch`**, `RestaurantStaff` → **`BusinessStaff`**, etc. |
| Prisma | All FK fields use **`businessId`** with `@map("restaurant_id")` for DB compatibility |
| Domain | `backend/src/domain/business/` — types, mapper, repository, `resolveBusinessId()` |
| Services | **`BusinessesService`** uses **`BusinessRepository`** (canonical public read API) |
| Compat | **`RestaurantsService`** / **`/restaurants/*`** retained; delegate same Prisma model |
| JWT | Payload includes **`businessId`** + deprecated **`restaurantId`** mirror |

### Migration plan (future, not required for launch)

| Phase | Action | Risk |
|-------|--------|------|
| 1 (done) | Prisma rename + `@@map` | Low — no table rename |
| 2 | Deprecation headers on `/restaurants` routes | Low |
| 3 | Optional SQL: `ALTER TABLE restaurants RENAME TO businesses` | Medium — downtime/coordination |
| 4 | Rename column `restaurant_id` → `business_id` in all tables | High — only after phase 3 |

**Recommendation:** Stay on phase 1–2 until all clients use `/businesses`. Table rename is cosmetic if `@@map` is correct.

---

## 3. Business role architecture

### Status: ✅ Aligned

| Item | Status |
|------|--------|
| Single staff role `BUSINESS` | ✅ In `UserRole` enum |
| `RESTAURANT_OWNER` / `RESTAURANT_STAFF` removed from DB enum | ✅ Migration `20250601000000` |
| Legacy JWT / frontend accepts old role strings | ✅ `isBusinessRole()` helper |
| Universal `/business` panel | ✅ Exists; `/restaurant` redirects |
| One staff user → one or more businesses via `BusinessStaff` | ✅ |

No further role splits needed (e.g. `GROCERY_OWNER`) — **business type is data, not auth**.

---

## 4. Multi-business data model

### Current `Business` fields (via `restaurants` table)

| Field | Present | Notes |
|-------|---------|-------|
| id, businessTypeId, name, slug | ✅ | |
| logo, banner (cover), description, phone | ✅ | `logoUrl`, `coverUrl` |
| address, lat, lng | ✅ | Via **`BusinessBranch`** (multi-location ready) |
| schedule | ✅ | `BusinessWorkingHours`, `BusinessHoliday` |
| delivery settings | ⚠️ Partial | Global zones in `delivery_zones`; per-business fees via `minOrderAmount`, `avgPrepMinutes` |
| rating, reviewCount | ✅ | |
| status | ✅ | `isActive`, `approvalStatus` |

### Gaps (recommended, not blocking)

- Per-business delivery radius / fee overrides (JSON on `Business` or `BusinessDeliverySettings` table).
- `Business.status` enum (ACTIVE, PAUSED, PENDING) vs boolean `isActive` + approval — consolidate later.

---

## 5. Product system audit

### Critical issues (found)

- Products tied to `restaurantId` in code paths — implied food-only.
- `ProductsService.findByRestaurant` naming.

### Applied fixes

- Prisma: `Product.businessId`, `Product.productCategoryId`.
- **`ProductsService.findByBusiness()`** — generic for any vertical.
- Create/update DTOs accept **`businessId`** + legacy **`restaurantId`**.
- No food-specific logic in product CRUD.

### Status: ✅ Generic product model

---

## 6. Courier / taxi / third-party delivery preparation

### Applied

```prisma
enum DeliveryProviderType {
  INTERNAL
  COURIER_NETWORK
  TAXI
  THIRD_PARTY
}
```

On `Order`:

- `deliveryProviderType` (default `INTERNAL`)
- `externalDeliveryRef` (nullable — external job ID)

### Usage (future)

| Provider | `deliveryProviderType` | `courierId` | `externalDeliveryRef` |
|----------|------------------------|-------------|------------------------|
| In-house courier | INTERNAL | set | null |
| Partner network | COURIER_NETWORK | null | partner order id |
| Taxi | TAXI | null | taxi trip id |
| Aggregator | THIRD_PARTY | null | aggregator id |

**No schema redesign required** when enabling taxi or external couriers.

---

## 7. Mobile / multi-client API strategy

### Principle: one public API surface

| Client | Should use |
|--------|------------|
| Web customer | `/businesses`, `/business-types`, `/categories?businessId=` |
| Customer app | Same |
| Courier app | `/orders`, WebSocket `joinBusiness` / legacy `joinRestaurant` |
| Driver app (future) | Same order APIs + `deliveryProviderType` |
| Business panel | `/restaurants/admin` (compat) → migrate to `/businesses/admin` |

### Applied

- `frontend/src/lib/api/business.ts` — canonical client helpers.
- WebSocket rooms: `business:{id}` + legacy `restaurant:{id}`.

---

## 8. Admin panel

### Business types (verticals)

| Requirement | Status |
|-------------|--------|
| CRUD | ✅ `/admin/business-types` |
| Image upload | ✅ |
| Icon (emoji) | ✅ |
| Sort order | ✅ |
| Active/inactive | ✅ (soft delete) |

### Product categories (per business)

| Requirement | Status |
|-------------|--------|
| CRUD per business | ✅ `/admin/categories` |
| Image/icon/description | ✅ Schema + DTO; UI can be extended |
| Sort / active | ✅ |

**Recommendation:** Rename admin nav “Categories” → **“Product categories”** and “Shop categories” → **“Business types”** (partially done).

---

## Database changes (this audit)

| Migration | Contents |
|-----------|----------|
| `20250601000000_business_architecture` | `business_types`, role enum, ratings on restaurants |
| `20250602000000_architecture_foundation` | `DeliveryProviderType`, order delivery fields, product category media columns |

**Deploy:** `npx prisma migrate deploy && npx prisma generate`

---

## Breaking changes

| Change | Mitigation |
|--------|------------|
| Prisma client: `Restaurant` → `Business` | Backend rebuilt; no public Prisma exposure |
| `GET /categories` without `businessId` no longer valid for product categories | Was already required on categories controller; marketplace misuse removed |
| JWT should include `businessId` | `restaurantId` still mirrored |
| WebSocket prefer `joinBusiness` | `joinRestaurant` still works |

---

## Future scalability risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dual naming (`restaurants` table vs `Business` model) | Medium | Document; plan table rename |
| `RestaurantsService` vs `BusinessesService` duplication | Medium | Consolidate admin writes into `BusinessesService` |
| Per-business delivery rules missing | Medium | Add `BusinessDeliverySettings` |
| Global vs per-business product category templates | Low | Optional `ProductCategoryTemplate` seed table |
| Taxi module as separate app | Low | Use `deliveryProviderType` + adapter pattern |
| Manager role scope (city zones) | Low | Extend `Manager.zone` |

---

## Applied fixes summary

1. Separated **BusinessType** and **ProductCategory** in schema, APIs, and docs.
2. Renamed Prisma domain to **Business** with DB-compatible `@map`.
3. Added **`backend/src/domain/business/`** repository layer.
4. **`BusinessesService`** as canonical public merchant API.
5. **`DeliveryProviderType`** on orders for external/taxi delivery.
6. Product system decoupled from restaurant naming.
7. JWT + WebSocket + query param **backward compatibility**.
8. Frontend **`lib/api/business.ts`** for shared client contracts.

---

## Recommended next steps (priority order)

1. Run migrations on production.
2. Update admin UI labels (product categories vs business types).
3. Add deprecation Swagger notes on `/restaurants` controllers.
4. Migrate frontend hooks to `lib/api/business.ts` exclusively.
5. Add per-business delivery settings model when onboarding groceries/pharmacy.
6. Plan table rename (`restaurants` → `businesses`) only after 100% API migration.

---

## File reference

| Path | Role |
|------|------|
| `backend/prisma/schema.prisma` | Domain models |
| `backend/src/domain/business/` | Abstraction layer |
| `backend/src/modules/businesses/` | Public merchant API |
| `backend/src/modules/business-types/` | Vertical types |
| `backend/src/modules/categories/` | Product categories |
| `backend/src/modules/marketplace/` | Discovery endpoints |
| `frontend/src/lib/api/business.ts` | Client API contract |
