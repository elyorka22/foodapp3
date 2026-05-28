# FoodApp — Food Delivery Platform (MVP)

Production-ready monolith architecture for a startup food delivery platform (Uzum Tezkor / Yandex Eats style), designed to run on **one DigitalOcean VPS** with a clear path to scale.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind, Zustand, TanStack Query, PWA |
| Backend | NestJS, Prisma, PostgreSQL, Redis, JWT, Socket.IO |
| Infra | Docker Compose, Nginx |

## Features

- **Guest checkout** — phone, address, GPS pin, optional comment (no registration)
- **Roles** — Super Admin, Manager, Restaurant, Courier
- **Order flow** — 8 statuses with WebSocket realtime tracking
- **Courier pay** — distance-based (configurable per km + minimum fee)
- **OTP-ready** — `guest_orders.otp_*` fields for future SMS verification

## Quick start (local)

```bash
# 1. Copy env
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Start DB + Redis
docker compose up -d postgres redis

# 3. Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Customer app: http://localhost:3000  
- API + Swagger: http://localhost:4000/api/docs  

### Demo accounts (password: `Admin123!`)

| Email | Role |
|-------|------|
| admin@foodapp.local | Super Admin |
| manager@foodapp.local | Manager |
| owner@foodapp.local | Restaurant |
| courier@foodapp.local | Courier |

## Project structure

```
foodapp3/
├── backend/          # NestJS API
├── frontend/         # Next.js App Router
├── nginx/            # Reverse proxy config
├── docker-compose.yml
├── DEPLOYMENT.md     # DigitalOcean guide
└── scripts/          # Backup scripts
```

## API examples

```bash
# List restaurants (public)
curl http://localhost:4000/api/v1/restaurants

# Guest order
curl -X POST http://localhost:4000/api/v1/orders/guest \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "<uuid>",
    "phone": "+998901234567",
    "deliveryAddress": "Tashkent, Chilonzor",
    "latitude": 41.31,
    "longitude": 69.24,
    "items": [{ "productId": "<uuid>", "quantity": 2 }]
  }'

# Staff login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodapp.local","password":"Admin123!"}'
```

## Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for DigitalOcean VPS, SSL, backups, and scaling notes.

## Future-ready

Architecture supports later extraction of: API server, DB server, S3 storage, CDN, load balancer, Kubernetes, message queues — without rewriting business logic.
