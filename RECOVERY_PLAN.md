# FoodApp — Infrastructure Recovery Plan

> **Context:** DigitalOcean Droplet, Spaces bucket, and PostgreSQL were permanently deleted.  
> **Goal:** Bring the application back online on a **fresh empty database**. Data recovery is **not** required.

**Repository:** `foodapp3` monorepo  
**Production domain (hardcoded in repo):** `foodapp.uz`  
**Last audited:** 2026-08-31

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Infrastructure Requirements](#2-infrastructure-requirements)
3. [Environment Variables](#3-environment-variables)
4. [Fresh Database Initialization](#4-fresh-database-initialization)
5. [Storage Setup (DigitalOcean Spaces)](#5-storage-setup-digitalocean-spaces)
6. [Deployment on Ubuntu 24.04 (DigitalOcean)](#6-deployment-on-ubuntu-24-04-digitalocean)
7. [SSL & Domain Configuration](#7-ssl--domain-configuration)
8. [Application Startup Commands](#8-application-startup-commands)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Manual Data Recreation](#10-manual-data-recreation)
11. [Hardcoded Production References](#11-hardcoded-production-references)
12. [Critical Blockers & Missing Secrets](#12-critical-blockers--missing-secrets)
13. [Optional Features (Enable Later)](#13-optional-features-enable-later)

---

## 1. Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │           DigitalOcean Droplet           │
                    │  ┌─────────┐  ┌─────┐  ┌─────────────┐  │
  Internet ────────►│  │  Nginx  │─►│ web │  │     api     │  │
  :443 / :80        │  │  :443   │  │:3000│  │    :4000    │  │
                    │  └────┬────┘  └──┬──┘  └──────┬──────┘  │
                    │       │          │             │         │
                    │       │    Next.js 15     NestJS 10      │
                    │       │    (standalone)   Prisma ORM     │
                    │       │                     │    │       │
                    │       │              ┌──────┘    └──────┐│
                    │       │              ▼                 ▼  │
                    │       │         PostgreSQL 16      Redis 7│
                    │       │         (Docker volume)    (in-mem)│
                    └───────┼───────────────────────────────────┘
                            │
                            ▼
              DigitalOcean Spaces (S3-compatible CDN)
              banners/, restaurants/, products/

  Mobile apps (Flutter)          External services
  ├── customer_mobile            ├── Firebase (Google Auth + FCM)
  ├── business_mobile            └── (No SMTP, no payment gateway, no maps API)
  └── courier_mobile
```

### Components

| Layer | Technology | Path | Notes |
|-------|------------|------|-------|
| **Frontend (customer + admin web)** | Next.js 15, TypeScript, Tailwind, PWA | `frontend/` | Single app: customer site + `/admin`, `/business`, `/courier` panels |
| **Backend API** | NestJS 10, Prisma, JWT, Socket.IO | `backend/` | REST at `/api/v1/*`, WebSockets at `/socket.io/` |
| **Database** | PostgreSQL 16 | Docker service `postgres` | 36 Prisma migrations |
| **Cache / rate limit** | Redis 7 | Docker service `redis` | Brute-force lockout, health checks |
| **Reverse proxy** | Nginx Alpine | `nginx/` | SSL termination, `/api/` + `/socket.io/` → API, `/` → web |
| **Object storage** | DigitalOcean Spaces | via `@aws-sdk/client-s3` | **Required in production** — no local disk uploads |
| **Workers / cron** | — | — | **None.** Migrations run on API container start |
| **CI/CD (server)** | — | — | **None.** Manual `docker compose` deploy |
| **CI/CD (mobile)** | GitHub Actions | `.github/workflows/*-mobile-apk.yml` | APK builds only |

### Mobile apps (separate deploy)

| App | Path | Connects via |
|-----|------|--------------|
| Customer | `apps/customer_mobile/` | `--dart-define=API_BASE_URL`, `WS_BASE_URL` |
| Business | `apps/business_mobile/` | `--dart-define=API_BASE_URL` |
| Courier | `apps/courier_mobile/` | `--dart-define=API_BASE_URL`, `WS_BASE_URL` |

Mobile apps are **not** deployed by Docker Compose. Rebuild APKs after the API is live.

---

## 2. Infrastructure Requirements

### Minimum VPS (matches existing docs)

| Resource | Spec |
|----------|------|
| **OS** | Ubuntu 24.04 LTS (22.04+ also works) |
| **CPU / RAM** | 2 vCPU / 4 GB RAM |
| **Disk** | 40+ GB SSD |
| **Ports** | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

### DigitalOcean resources to recreate

| Resource | Purpose | Required? |
|----------|---------|-----------|
| **Droplet** | Runs Docker Compose stack | **Yes** |
| **Spaces bucket** | Image uploads (banners, logos, products) | **Yes** (API refuses prod boot without it) |
| **Spaces CDN** | Public image URLs | **Yes** |
| **Spaces access keys** | S3 API credentials | **Yes** |
| **Domain DNS A-record** | Point `foodapp.uz` → Droplet IP | **Yes** (if using existing domain) |
| **Managed PostgreSQL** | — | No (runs in Docker for MVP) |
| **Managed Redis** | — | No (runs in Docker for MVP) |

### Deployment files present in repo

| File | Status |
|------|--------|
| `docker-compose.yml` | ✅ Complete (postgres, redis, api, web, nginx) |
| `backend/Dockerfile` | ✅ Multi-stage Node 20 |
| `frontend/Dockerfile` | ✅ Next.js standalone |
| `backend/docker-entrypoint.sh` | ✅ Auto-runs `prisma migrate deploy` |
| `nginx/nginx.conf` | ✅ Present |
| `nginx/conf.d/foodapp.conf` | ✅ Hardcoded for `foodapp.uz` |
| `DEPLOYMENT.md` | ✅ General guide |
| `docs/DIGITALOCEAN_SPACES_SETUP.md` | ✅ Spaces guide |
| `scripts/backup-db.sh` | ✅ DB backup cron script |
| `scripts/db-fix-failed-migration.sh` | ✅ Migration repair |
| `scripts/seed.sh` | ✅ Wrapper for prisma seed |
| **Caddy config** | ❌ Not used |
| **PM2 ecosystem** | ❌ Not present (Docker recommended) |
| **GitHub Actions server deploy** | ❌ Not present |
| **Terraform / K8s** | ❌ Not present |

---

## 3. Environment Variables

Copy root template: `cp .env.example .env`

### 3.1 Database & core API (REQUIRED)

| Variable | Example | Used by | Notes |
|----------|---------|---------|-------|
| `POSTGRES_USER` | `foodapp` | postgres container | Default in compose |
| `POSTGRES_PASSWORD` | *(strong random)* | postgres, DATABASE_URL | **Change from default** |
| `POSTGRES_DB` | `foodapp` | postgres | |
| `DATABASE_URL` | `postgresql://foodapp:PASS@postgres:5432/foodapp?schema=public` | Prisma | Compose overrides host to `postgres` |
| `NODE_ENV` | `production` | API | Triggers production env validation |
| `PORT` | `4000` | API | Internal only (nginx proxies) |
| `JWT_SECRET` | *(openssl rand -base64 48)* | Auth | **≥32 chars**, no `change-me` |
| `JWT_EXPIRES_IN` | `7d` | Auth | Optional |
| `CORS_ORIGINS` | `https://foodapp.uz` | API, WebSocket gateways | Must match public origin |
| `TRUST_PROXY_HOPS` | `1` | API | Required behind nginx |

Generate JWT secret:
```bash
openssl rand -base64 48
```

### 3.2 Redis (REQUIRED for full functionality)

| Variable | Example | Notes |
|----------|---------|-------|
| `REDIS_HOST` | `redis` | Set by compose |
| `REDIS_PORT` | `6379` | |
| `REDIS_PASSWORD` | *(optional but recommended)* | Set same value in compose redis command + API |

### 3.3 DigitalOcean Spaces (REQUIRED in production)

| Variable | Example |
|----------|---------|
| `SPACES_ENDPOINT` | `https://nyc3.digitaloceanspaces.com` |
| `SPACES_REGION` | `nyc3` |
| `SPACES_BUCKET` | `foodapp-assets` |
| `SPACES_ACCESS_KEY` | `DO00...` |
| `SPACES_SECRET_KEY` | *(secret)* |
| `SPACES_CDN_URL` | `https://foodapp-assets.nyc3.cdn.digitaloceanspaces.com` |

Validated in `backend/src/config/bootstrap-env.ts` — API **will not start** if any are missing when `NODE_ENV=production`.

### 3.4 Frontend build args (REQUIRED at Docker build time)

| Variable | Production value | Notes |
|----------|------------------|-------|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | Relative URL (nginx proxies `/api/`) |
| `NEXT_PUBLIC_WS_URL` | *(empty string)* | Same-origin WebSocket via nginx |

**Gap:** `NEXT_PUBLIC_FIREBASE_*` vars are **not** wired in `frontend/Dockerfile`. Google Sign-In on web requires adding build args manually if needed.

### 3.5 Firebase (OPTIONAL — required for Google login + push)

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | e.g. `foodapp-17385` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full JSON as single-line string |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternative: path to JSON file |
| `PUSH_PROVIDER` | `firebase` to enable FCM (default: `noop`) |

### 3.7 Rate limiting (OPTIONAL — have defaults)

| Variable | Default |
|----------|---------|
| `THROTTLE_TTL` | `60000` |
| `THROTTLE_LIMIT` | `400` |
| `BRUTE_FORCE_MAX_ATTEMPTS` | `10` |
| `BRUTE_FORCE_LOCK_TTL` | `900` |
| `APP_TIMEZONE` | `Asia/Tashkent` |

### 3.8 Mobile build-time (--dart-define / GitHub secrets)

| App | Required defines |
|-----|------------------|
| Customer | `API_BASE_URL=https://foodapp.uz/api/v1`, `WS_BASE_URL=https://foodapp.uz` |
| Business | `API_BASE_URL=https://foodapp.uz/api/v1` |
| Courier | `API_BASE_URL=https://foodapp.uz/api/v1`, `WS_BASE_URL=https://foodapp.uz` |

---

## 4. Fresh Database Initialization

There is **no** separate schema dump. The database is created entirely from Prisma migrations + optional seed.

### Step-by-step (empty database)

```bash
# 1. Start postgres + redis only (optional — or full stack)
docker compose up -d postgres redis

# 2. Wait for postgres healthy, then migrate
docker compose up -d api    # entrypoint runs: npx prisma migrate deploy

# OR manually:
docker compose exec api npx prisma migrate deploy

# 3. Seed demo data + admin accounts
docker compose exec api npx prisma db seed
# OR: ./scripts/seed.sh
```

### What migrations create automatically (no seed needed)

| Data | Source |
|------|--------|
| Full schema (47 models) | 36 migration files in `backend/prisma/migrations/` |
| Notification templates | Migrations `20250607000000`, `20250609120000` |
| Default city "Chust" | Migration `20250618000000_cities` |
| Business type taxonomy structure | Migration `20250601000000` (types filled by seed) |

### What seed creates (`backend/prisma/seed.ts`)

| Entity | Details |
|--------|---------|
| **Super Admin** | `admin@foodapp.local` / phone `+998900000001` / password **`Admin123!`** |
| **Manager** | `manager@foodapp.local` / password **`Admin123!`** |
| **Business owner** | `owner@foodapp.local` / password **`Admin123!`** |
| **Courier** | `courier@foodapp.local` / password **`Admin123!`** |
| **Business types** | restaurant, grocery, flowers, perfume, gift, pharmacy, electronics |
| **Demo restaurant** | "Demo Pizza" (`demo-pizza`), approved, Tashkent branch |
| **Dish category** | Pizza |
| **Demo product** | Margherita — 45,000 UZS |
| **Delivery pricing** | `delivery_pricing` setting (baseFee 0, pricePerKm 3000, etc.) |
| **Demo banner** | Promo banner with placeholder path `/banners/promo1.jpg` |

Seed is **idempotent** (safe to re-run).

### Verify database

```bash
docker compose exec postgres psql -U foodapp -d foodapp -c "\dt"
docker compose exec api npx prisma migrate status
```

---

## 5. Storage Setup (DigitalOcean Spaces)

See full guide: `docs/DIGITALOCEAN_SPACES_SETUP.md`

### Quick steps

1. **Create Space** — region near droplet (e.g. `nyc3`), enable CDN, restrict listing
2. **Create access keys** — Spaces → API → Generate key
3. **Set env vars** in `.env` (all 6 `SPACES_*` variables)
4. **Verify after deploy:**
   ```bash
   curl https://foodapp.uz/api/v1/health/storage
   # Expected: {"status":"ok"}
   ```

### Upload flow

```
Admin panel → POST /api/v1/upload/image
           → StorageService → Spaces (public-read)
           → Returns CDN URL
```

- Max 10 MB, JPEG/PNG/WebP
- Keys: `banners/`, `restaurants/`, `products/` (folder from Referer header)
- **All previously uploaded images are gone** — re-upload via admin after deploy

### CORS on Spaces (if uploads fail from browser)

In Space settings → CORS, allow `GET`/`PUT` from your domain if using direct uploads.

---

## 6. Deployment on Ubuntu 24.04 (DigitalOcean)

### 6.1 Create Droplet

- Ubuntu 24.04 LTS, 2 vCPU / 4 GB
- Add SSH key
- Note public IP

### 6.2 Point DNS

```
A    foodapp.uz      → DROPLET_IP
A    www.foodapp.uz  → DROPLET_IP
```

### 6.3 Server bootstrap

```bash
ssh root@DROPLET_IP

apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git ufw certbot

ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

adduser deploy
usermod -aG docker deploy
```

### 6.4 Clone & configure

```bash
su - deploy
git clone https://github.com/elyorka22/foodapp3.git /opt/foodapp
cd /opt/foodapp
cp .env.example .env
nano .env   # fill ALL required secrets (see Section 3)
```

**Minimum `.env` checklist before build:**
- [ ] `POSTGRES_PASSWORD` — changed
- [ ] `JWT_SECRET` — 48+ random chars
- [ ] `REDIS_PASSWORD` — set
- [ ] All 6 `SPACES_*` — new bucket credentials
- [ ] `CORS_ORIGINS=https://foodapp.uz`
- [ ] `API_PUBLIC_URL=https://foodapp.uz`
- [ ] `NEXT_PUBLIC_API_URL=/api/v1`
- [ ] `NEXT_PUBLIC_WS_URL=` (empty)

### 6.5 SSL certificate (before first HTTPS start)

Nginx config expects certs at `/etc/letsencrypt/live/foodapp.uz/`.

**Option A — obtain cert before starting nginx:**

```bash
# Stop anything on :80, then:
sudo certbot certonly --standalone -d foodapp.uz -d www.foodapp.uz
```

**Option B — start HTTP-only first, then certbot:**

Temporarily comment out the `:443` server block in `nginx/conf.d/foodapp.conf`, start stack, run certbot, restore config, restart nginx.

### 6.6 Build & start

```bash
cd /opt/foodapp
docker compose up -d --build
```

This will:
1. Start PostgreSQL + Redis
2. Build API → run migrations via entrypoint → start NestJS
3. Build Next.js frontend
4. Start Nginx on ports 80/443

### 6.7 Seed database

```bash
docker compose exec api npx prisma db seed
```

### 6.8 Verify

```bash
curl -sS http://127.0.0.1/api/v1/health | jq .
curl -sS https://foodapp.uz/api/v1/health | jq .
curl -sI https://foodapp.uz/ | head -5
```

Expected health response:
```json
{
  "status": "healthy",
  "services": { "database": "ok", "redis": "ok" }
}
```

---

## 7. SSL & Domain Configuration

### Nginx config location

`nginx/conf.d/foodapp.conf` — hardcoded for `foodapp.uz`.

If using a **different domain**, edit before deploy:
- `server_name` lines (2 blocks)
- SSL cert paths under `/etc/letsencrypt/live/YOUR_DOMAIN/`
- Update `.env`: `CORS_ORIGINS`, `API_PUBLIC_URL`

### Cert renewal

```bash
# Add to root crontab:
0 3 * * * certbot renew --quiet && docker compose -f /opt/foodapp/docker-compose.yml exec nginx nginx -s reload
```

### WebSocket

Nginx proxies `/socket.io/` to API with upgrade headers — already configured.

---

## 8. Application Startup Commands

### Production (Docker — recommended)

```bash
cd /opt/foodapp

# Full stack
docker compose up -d --build

# Migrations only (also runs automatically on api start)
docker compose exec api npx prisma migrate deploy

# Seed
docker compose exec api npx prisma db seed

# Logs
docker compose logs -f api web nginx

# Restart single service
docker compose restart api

# Rebuild after code update
git pull
docker compose up -d --build
docker compose exec api npx prisma migrate deploy
```

### Local development (without full Docker)

```bash
docker compose up -d postgres redis
cd backend && npm install && npx prisma migrate dev && npm run prisma:seed && npm run start:dev
cd frontend && npm install && npm run dev
```

### Health & diagnostics

```bash
curl https://foodapp.uz/api/v1/health
curl https://foodapp.uz/api/v1/health/storage
docker compose ps
docker compose logs api --tail=100
```

---

## 9. Post-Deployment Checklist

### Immediate (Day 0)

- [ ] Health endpoint returns `healthy`
- [ ] Storage health returns `ok`
- [ ] Homepage loads at `https://foodapp.uz`
- [ ] Admin login works at `https://foodapp.uz/staff/login?app=admin`
- [ ] **Change all seed passwords** (`Admin123!`) immediately
- [ ] Create production admin account with real email/phone
- [ ] Delete or deactivate demo accounts if not needed
- [ ] Upload new banner images (seed banner path is broken without file)
- [ ] Configure admin settings (`/admin/settings`): app name, home title, support contacts
- [ ] Set up DB backup cron: `scripts/backup-db.sh`

### Content (Week 1)

- [ ] Create real restaurants via `/admin/restaurants`
- [ ] Create product stores via `/admin/stores`
- [ ] Upload logos, covers, product images (Spaces)
- [ ] Configure dish categories via `/admin/dish-categories`
- [ ] Configure home banners via `/admin/banners/home`
- [ ] Configure promo banners via `/admin/banners/promo`
- [ ] Configure store banners via `/admin/stores/banners`
- [ ] Set delivery pricing via admin settings
- [ ] Add/configure cities if needed (`/admin/cities`)
- [ ] Configure business working hours per merchant

### Integrations (when ready)

- [ ] Firebase: set service account JSON, enable `PUSH_PROVIDER=firebase`
- [ ] Rebuild mobile APKs with production `API_BASE_URL`
- [ ] Publish updated APKs to Play Store / distribute internally

### Security

- [ ] Rotate JWT_SECRET from any previously leaked value
- [ ] Strong POSTGRES_PASSWORD and REDIS_PASSWORD
- [ ] UFW enabled (22, 80, 443 only)
- [ ] Disable root SSH login (optional hardening)
- [ ] Set up UptimeRobot on `/api/v1/health`

---

## 10. Manual Data Recreation

Everything below was **lost** and must be recreated manually (or via seed for demo data only).

### Automatically restored by migrations

| Data | Notes |
|------|-------|
| Database schema | All tables, indexes, enums |
| Notification templates | Push/in-app message templates |
| Default city "Chust" | Can add more cities in admin |

### Restored by seed (demo only — replace for production)

| Data | Action needed |
|------|---------------|
| Admin/Manager/Owner/Courier accounts | Change passwords; create real accounts |
| Business types (7 categories) | Seed creates them; verify in admin |
| Demo Pizza restaurant + Margherita | Replace with real merchants |
| Delivery pricing defaults | Review in admin settings |
| Placeholder promo banner | Re-upload image to Spaces |

### Must recreate manually in admin

| Data | Admin path | Priority |
|------|------------|----------|
| **Admin users & roles** | `/admin` → Users | **Critical** |
| **Restaurants** | `/admin/restaurants` | **Critical** |
| **Product stores** | `/admin/stores` | High |
| **Products / menu items** | `/admin/products/restaurant`, `/admin/products/store` | **Critical** |
| **Dish categories** | `/admin/dish-categories` | High |
| **Store categories** | `/admin/stores/categories` | High |
| **Banners (home/promo/store)** | `/admin/banners/*`, `/admin/stores/banners` | High |
| **Homepage settings** | `/admin/settings` | High |
| **Delivery pricing & zones** | Admin settings | High |
| **Cities** | `/admin/cities` | Medium |
| **Promo codes** | Admin promo section | Low |
| **Booking venues** | Admin booking | Low |
| **Business working hours** | Per-merchant admin | High |
| **All uploaded images** | Re-upload via admin | **Critical** |

### Roles in system

| Role | Login table | Panel URL |
|------|-------------|-----------|
| SUPER_ADMIN | `users` | `/admin` |
| MANAGER | `users` | `/admin` (limited permissions) |
| BUSINESS | `users` | `/business` |
| COURIER | `users` | `/courier` |
| CUSTOMER | `customers` | Mobile app / web customer auth |

Staff login: `POST /api/v1/auth/login` → `https://foodapp.uz/staff/login`

---

## 11. Hardcoded Production References

These reference `foodapp.uz` or old infrastructure. **No code changes required** if you keep the same domain. Update if domain changed.

| Location | Reference |
|----------|-----------|
| `nginx/conf.d/foodapp.conf` | `foodapp.uz`, Let's Encrypt paths |
| `.env.example` | `API_PUBLIC_URL`, `CORS_ORIGINS` examples |
| `frontend/src/lib/seo.ts` | `SITE_URL = 'https://foodapp.uz'` |
| `frontend/src/app/sitemap.ts` | `https://foodapp.uz` |
| `frontend/src/app/*/layout.tsx` | SSR API fallback `https://foodapp.uz/api/v1` |
| `frontend/src/app/privacy|terms|delete-account` | `support@foodapp.uz` |
| Mobile `app_config.dart` examples | `https://foodapp.uz/api/v1` |
| Firebase project | `foodapp-17385` (hardcoded in mobile `firebase_options.dart`) |
| Google OAuth client | `278845357182-...apps.googleusercontent.com` (customer app) |

**No hardcoded Spaces bucket names in runtime code** — all via env vars.

---

## 12. Critical Blockers & Missing Secrets

### A. Will prevent deployment / API boot

| Issue | Resolution |
|-------|------------|
| Missing `JWT_SECRET` (< 32 chars) | Generate with `openssl rand -base64 48` |
| Missing any `SPACES_*` variable in production | Create new Spaces bucket + keys |
| SSL certs missing before nginx HTTPS start | Run certbot first (Section 6.5) |
| DNS not pointing to new droplet | Update A records |
| `nginx/conf.d/foodapp.conf` domain mismatch | Edit if not using `foodapp.uz` |

### B. Secrets you must recreate manually (not in git)

| Secret | Where to get |
|--------|--------------|
| `JWT_SECRET` | Generate new (do not reuse old) |
| `POSTGRES_PASSWORD` | Choose new strong password |
| `REDIS_PASSWORD` | Choose new |
| `SPACES_ACCESS_KEY` + `SPACES_SECRET_KEY` | New DigitalOcean Spaces keys |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Project Settings → Service Accounts |
| Android keystore + passwords | Your local secure storage (for APK signing) |
| GitHub Actions secrets | Re-enter in repo settings for CI APK builds |

### C. Features that degrade gracefully if not configured

| Feature | Missing config behavior |
|---------|------------------------|
| Firebase / FCM | Push notifications disabled (`PUSH_PROVIDER=noop`) |
| Google Sign-In (web) | Hidden if `NEXT_PUBLIC_FIREBASE_*` not in build |
| Google Sign-In (mobile) | Works if Firebase project unchanged |
| Seed banner image | 404 image until re-uploaded |

---

## 13. Optional Features (Enable Later)

| Feature | Status in codebase |
|---------|-------------------|
| Email / SMTP | **Not implemented** |
| SMS / OTP | Schema fields exist, **no sender** |
| Payment gateway (Stripe/Payme/Click) | **Not implemented** (Payment model only) |
| Maps / routing API | Haversine distance only |
| Background job queue | **Not implemented** |
| Managed DB / Redis | Documented scaling path in DEPLOYMENT.md §8 |

---

## Quick Recovery Command Sequence

Copy-paste sequence for experienced operator:

```bash
# ON NEW DROPLET (as deploy user)
git clone https://github.com/elyorka22/foodapp3.git /opt/foodapp && cd /opt/foodapp
cp .env.example .env && nano .env

# SSL (as root, before nginx HTTPS)
sudo certbot certonly --standalone -d foodapp.uz -d www.foodapp.uz

# Deploy
docker compose up -d --build
docker compose exec api npx prisma db seed

# Verify
curl -sS https://foodapp.uz/api/v1/health
curl -sS https://foodapp.uz/api/v1/health/storage

# Login: https://foodapp.uz/staff/login?app=admin
# Email: admin@foodapp.local  Password: Admin123!  (CHANGE IMMEDIATELY)
```

---

## Related Documentation

| File | Topic |
|------|-------|
| `DEPLOYMENT.md` | Original deployment guide |
| `docs/DIGITALOCEAN_SPACES_SETUP.md` | Spaces/CDN setup |
| `FCM_DEPLOYMENT.md` | Push notifications |
| `FIREBASE_SETUP.md` | Firebase auth setup |
| `README.md` | Local dev quick start |

---

*Generated from repository audit. No application code was modified.*
