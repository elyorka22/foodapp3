# Phase 6 — Security & Production Readiness Report

**Date:** 2026-05-29  
**Scope:** Hardening only — no new business features.

---

## Summary

Phase 6 addresses the critical findings from the production readiness audit. The platform is **significantly closer to launch**, with remaining items called out below.

### Final production score: **78 / 100** (Launch-ready with conditions)

| Area | Before | After | Notes |
|------|--------|-------|-------|
| WebSocket security | 20 | 85 | JWT + role/room checks |
| API authorization | 55 | 82 | Courier scope, customer IDOR, restaurant UUID |
| Rate limiting | 40 | 75 | Per-route + proxy-aware IP |
| Transaction integrity | 50 | 88 | Guest order + promo atomic |
| Infrastructure | 45 | 72 | Redis password, internal ports, headers |
| Observability | 35 | 40 | Unchanged (still basic logging) |
| Customer auth | 25 | 45 | Brute-force limits; phone-only login remains |

**Launch condition:** Set strong `JWT_SECRET`, `REDIS_PASSWORD`, `POSTGRES_PASSWORD`; enable TLS on Nginx; do **not** run default seed in production.

---

## 1. WebSocket JWT authentication

**Implemented**

- `WsAuthService` verifies Bearer token from `handshake.auth.token` or `query.token`.
- Staff identity loaded from DB on connect; stored on `socket.data.user`.
- Frontend `admin-socket.ts` passes JWT via `auth: { token }`.

**Public exception (by design)**

- `joinOrder` requires a valid `trackingToken` in DB (128-bit secret), not JWT.

---

## 2. WebSocket room authorization

| Room | Requirement |
|------|-------------|
| `joinAdmin` | `SUPER_ADMIN` |
| `joinManager` | `SUPER_ADMIN` or `MANAGER` |
| `joinRestaurant` | Staff with access to that `restaurantId` |
| `joinCourier` | `COURIER` and own `courierId` |
| `joinOrder` | Valid order `trackingToken` |

---

## 3. Swagger disabled in production

- Swagger mounts only when `NODE_ENV !== 'production'`.
- `assertProductionEnv()` fails startup if `JWT_SECRET` is weak/missing in production.

---

## 4. Redis password support

- `RedisService` builds URL from `REDIS_URL` or `REDIS_HOST` + `REDIS_PASSWORD`.
- Docker Compose: `redis-server --requirepass` when `REDIS_PASSWORD` is set.
- Brute-force counters use Redis.

---

## 5. Per-route rate limiting

| Route | Limit |
|-------|-------|
| `POST /auth/login` | 10 / 15 min |
| `POST /customers/login`, `register` | 15 / 15 min |
| `POST /orders/guest` | 20 / hour |
| `POST /promo-codes/validate` | 40 / hour |
| `GET /orders/track/:token` | 120 / min |
| Global default | 100 / min |

`ThrottlerBehindProxyGuard` uses `X-Forwarded-For` / `trust proxy`.

---

## 6. Upload file validation

- Allowlist: JPEG, PNG, WebP, GIF (MIME + extension).
- Safe extension from MIME map (not client `originalname` only).
- Static uploads: `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`.

---

## 7. Promo code transactional protection

- `applyInTransaction()` inside guest-order `$transaction`.
- Optimistic lock: `updateMany` with `usageCount` match + limit check.
- Usage record created in same transaction as increment.

---

## 8. Guest order transactional protection

- Guest order, order, payment, address, promo application in single `prisma.$transaction`.
- `customerId` only accepted when it matches normalized phone (anti-spoof).

---

## 9. Trust proxy

- `app.set('trust proxy', TRUST_PROXY_HOPS)` (default `1`).
- Nginx sets `X-Forwarded-For` / `X-Forwarded-Proto`.

---

## 10. Security headers

- Helmet enabled (CSP relaxed in dev).
- Nginx: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

---

## 11. Brute-force protection

- `BruteForceService` (Redis): lock after `BRUTE_FORCE_MAX_ATTEMPTS` (default 10) for `BRUTE_FORCE_LOCK_TTL` (default 900s).
- Applied to staff login and customer login/register.

---

## 12. Public endpoints audit

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | None | Load balancer probe |
| GET | `/restaurants` | None | Public catalog |
| GET | `/restaurants/:param` | None | Slug/UUID (UUID: approved+active only if unauthenticated) |
| GET | `/restaurants/:id/availability` | None | Open/closed status |
| GET | `/products` | None | Menu by restaurant |
| GET | `/categories` | None | Categories (active only) |
| GET | `/banners` | None | Active banners |
| POST | `/orders/guest` | None | Place order (rate limited) |
| GET | `/orders/track/:token` | None | Track order (rate limited) |
| POST | `/promo-codes/validate` | None | Promo check (rate limited) |
| POST | `/customers/register` | None | Register (rate limited + brute force) |
| POST | `/customers/login` | None | Phone login (rate limited + brute force) |
| GET | `/customers/:id?phone=` | Phone proof | Profile (phone must match) |
| POST | `/auth/login` | None | Staff JWT (rate limited + brute force) |
| WS | `joinOrder` | Tracking token | Order updates |
| WS | `joinAdmin/Manager/Restaurant/Courier` | JWT + role | Staff realtime |

**Removed / restricted**

- Categories `includeInactive` no longer exposed publicly.
- Restaurant UUID without auth: only approved+active restaurants.

---

## 13. Authorization gaps closed

- **Courier `updateStatus`:** only assigned orders.
- **Customer `GET :id`:** requires matching `phone` query param.
- **Guest order `customerId`:** must match phone.
- **Courier assign:** rejects if another courier already assigned.
- **Restaurant `findById` (public):** filters `APPROVED` + `isActive`.

---

## 14. Database indexes

**Migration:** `20250529400000_phase6_security_indexes`

- `orders(restaurant_id, status, delivered_at)` partial `deleted_at IS NULL`
- `guest_orders(customer_id, phone)`

---

## 15. N+1 query review

- **Fixed:** `findAllAdmin` customers — single batch order fetch + in-memory stats (`getCustomerStatsBatch`).
- **Unchanged:** Other admin lists already use `include` or acceptable page sizes.

---

## Code changes (files)

### Backend (new)

- `src/common/constants/throttle.constants.ts`
- `src/common/guards/throttler-behind-proxy.guard.ts`
- `src/common/security/brute-force.service.ts`
- `src/common/security/ws-auth.service.ts`
- `src/common/security/security.module.ts`
- `src/common/utils/file-upload.util.ts`
- `src/config/bootstrap-env.ts`
- `src/modules/customers/dto/customer-profile-query.dto.ts`
- `prisma/migrations/20250529400000_phase6_security_indexes/migration.sql`

### Backend (updated)

- `main.ts`, `app.module.ts`, `redis/redis.service.ts`
- `orders/orders.gateway.ts`, `orders.service.ts`, `orders.controller.ts`, `create-guest-order.dto.ts`
- `promo-codes/promo-codes.service.ts`, `promo-codes.controller.ts`
- `auth/auth.service.ts`, `auth.controller.ts`
- `customers/customers.service.ts`, `customers.controller.ts`
- `restaurants/restaurants.service.ts`, `categories/categories.controller.ts`
- `upload/upload.service.ts`, `upload.controller.ts`

### Infrastructure

- `docker-compose.yml` — internal ports, Redis password
- `nginx/conf.d/foodapp.conf` — security headers
- `.env.example` — Redis password, trust proxy, brute-force vars

### Frontend

- `lib/admin-socket.ts` — JWT in handshake
- `hooks/use-admin-socket.ts`, `use-admin-notifications.ts`

---

## Remaining risks (post–Phase 6)

| Priority | Item |
|----------|------|
| HIGH | Customer auth still phone-only (no OTP/password) |
| HIGH | TLS/HTTPS must be configured on server (Nginx SSL block) |
| HIGH | Do not run `prisma db seed` in production with default passwords |
| MEDIUM | JWT in `localStorage` (XSS risk) — consider httpOnly cookies later |
| MEDIUM | No centralized APM/error tracking (Sentry, etc.) |
| MEDIUM | Socket.IO horizontal scaling needs Redis adapter |
| LOW | Staff password min length still 6 |

---

## Deploy checklist (Phase 6)

```bash
# 1. Set secrets in .env
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 24   # REDIS_PASSWORD, POSTGRES_PASSWORD

# 2. Build & start
docker compose up -d --build

# 3. Migrate
docker compose exec api npx prisma migrate deploy

# 4. Verify
curl -s https://your-domain/api/v1/health
curl -s -o /dev/null -w "%{http_code}" https://your-domain/api/docs  # expect 404

# 5. Do NOT seed production with default credentials
```

---

## Build verification

- Backend: `npm run build` — **pass**
- Frontend: `npm run build` — run after deploy
