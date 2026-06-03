# FoodApp applications

Monorepo layout for client apps (isolated from `frontend/`, `backend/`, admin).

```
apps/
  customer_mobile/   # Flutter — customer app (active)
  courier_mobile/      # planned
  manager_mobile/      # planned
```

Web and admin remain at repository root:

- `frontend/` — Next.js customer web
- `backend/` — NestJS API (`/api/v1`)

## Customer mobile

```bash
cd apps/customer_mobile
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

- **Android emulator**: `10.0.2.2` → host `localhost:4000`
- **iOS simulator**: `http://127.0.0.1:4000/api/v1`
- **Physical device**: use your machine LAN IP
