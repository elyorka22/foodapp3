# iKuryer Mobile

Simple Flutter courier app for small-city delivery launch.

## Requirements

- Flutter SDK `>=3.5.0`
- Running FoodApp backend (`/api/v1`)

## Run (development)

```bash
cd apps/courier_mobile
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=http://localhost:3000/api/v1 \
  --dart-define=WS_BASE_URL=http://localhost:3000
```

For a physical device, replace `localhost` with your machine LAN IP.

## Release build

```bash
flutter build apk \
  --dart-define=API_BASE_URL=https://your-api.example.com/api/v1 \
  --dart-define=WS_BASE_URL=https://your-api.example.com
```

## Login

Couriers use staff auth:

```
POST /api/v1/auth/login
{ "phone": "+998...", "password": "..." }
```

Role must be `COURIER`.

## Main screens

| Screen | Purpose |
|--------|---------|
| Login | Phone + password |
| Home | Online/offline toggle, active delivery card |
| Incoming order | Accept available order |
| Active order | Status steps + OSM map |
| Complete | Success after delivery |
| Profile | Name, phone, logout |
| Notifications | Staff notification center |
| History | Last delivered orders |

## Design

- Primary: `#FF6B00`
- Background: `#FFFFFF`
- Same architecture as `customer_mobile` (Riverpod + go_router + Dio)

See [COURIER_ARCHITECTURE.md](./COURIER_ARCHITECTURE.md) for API details and future extensions.
