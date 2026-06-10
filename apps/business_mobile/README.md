# FoodApp Business Mobile

Flutter app for restaurant staff (`BUSINESS`) and platform managers (`MANAGER`, `SUPER_ADMIN`).

## Features

- Phone + password login (same API as courier app)
- Role-based routing after login
- **Restaurant panel:** orders, status updates, request courier, shift stats
- **Manager panel:** all orders, assign courier, couriers list

## Run locally

```bash
cd apps/business_mobile
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=https://your-api.example.com/api/v1
```

## Build release APK

```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-api.example.com/api/v1
```

## Test accounts

Use staff accounts from backend seed (`Admin123!`):

- Restaurant: `owner@foodapp.local` (or phone from seed)
- Manager: `manager@foodapp.local`
