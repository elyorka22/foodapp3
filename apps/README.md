# FoodApp applications

Monorepo layout for client apps (isolated from `frontend/`, `backend/`).

```
apps/
  customer_mobile/   # Flutter — customer app
  business_mobile/   # Flutter — BUSINESS + MANAGER
  courier_mobile/    # Flutter — couriers
  control_mobile/    # Flutter — FoodApp Control (SUPER_ADMIN, Android + Web)
```

Web and API remain at repository root:

- `frontend/` — Next.js customer web (+ current shared admin panel)
- `backend/` — NestJS API (`/api/v1`)

## FoodApp Control

```bash
cd apps/control_mobile
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=https://foodapp.uz/api/v1
```

See `control_mobile/README.md`.

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
