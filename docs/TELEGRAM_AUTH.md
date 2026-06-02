# Customer authentication (mobile-ready)

One HTTP API for all clients: **FoodApp Web**, **Flutter**, courier/taxi apps.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────┐
│ Web Widget  │     │ Flutter SDK  │     │ POST /api/v1/auth/      │
│ (optional)  │     │ telegram_*   │────▶│      telegram           │
└─────────────┘     └──────────────┘     └───────────┬─────────────┘
                                                     │
                                         TelegramSignatureService
                                         (HMAC verify)
                                                     │
                                         TelegramAuthService
                                         .authenticateVerifiedUser()
                                                     │
                                         CustomerTokenService → JWT
```

- **Telegram Login Widget** is Web-only UI. It only produces a signed JSON object.
- **TelegramAuthService** is platform-agnostic: verified user in → customer upsert → JWT out.
- **Flutter** skips the widget; POST the same JSON the SDK returns.

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `TELEGRAM_BOT_TOKEN` | Backend | HMAC verification |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Web only | Login Widget `data-telegram-login` |

## API contract (all mobile/web clients)

### `POST /api/v1/auth/telegram`

**Body** — standard Telegram signed user (snake_case):

```json
{
  "id": 123456789,
  "first_name": "Elyor",
  "last_name": "K",
  "username": "elyor",
  "photo_url": "https://t.me/i/userpic/...",
  "auth_date": 1717200000,
  "hash": "<hex-hmac>"
}
```

**Response:**

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "uuid",
    "needsPhone": true,
    "telegramId": "123456789",
    ...
  }
}
```

**JWT payload:** `{ "sub": "<customerId>", "role": "CUSTOMER", "authProvider": "TELEGRAM" }`

Use header: `Authorization: Bearer <accessToken>`

### Flutter example

```dart
// After Telegram SDK / telegram_login returns Map user
final response = await http.post(
  Uri.parse('$apiBase/auth/telegram'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'id': user['id'],
    'first_name': user['first_name'],
    'last_name': user['last_name'],
    'username': user['username'],
    'photo_url': user['photo_url'],
    'auth_date': user['auth_date'],
    'hash': user['hash'],
  }),
);
// Store accessToken; if user['needsPhone'] → navigate to complete-profile
```

### Phone fallback (unchanged)

- `POST /customers/register` → `{ accessToken, user }`
- `POST /customers/login` → `{ accessToken, user }`

### Profile completion

- `POST /customers/complete-profile` (Bearer customer JWT) — required phone for delivery

### Current user

- `GET /customers/me` (Bearer customer JWT)

## Backend services (NestJS)

| Service | Responsibility |
|---------|----------------|
| `TelegramSignatureService` | HMAC verify → `VerifiedTelegramUser` |
| `TelegramAuthService` | `signInWithTelegramPayload()` / `authenticateVerifiedUser()` → JWT |
| `CustomerTokenService` | JWT sign + user serialization |

Staff auth is separate: `POST /auth/login` (users table).

## Web frontend

- `lib/customer-auth.ts` — `signInWithTelegram(payload)` (API only)
- `TelegramLoginButton` — widget loader only; calls `signInWithTelegram` from the login page

## Migration

```bash
cd backend && npx prisma migrate deploy
```
