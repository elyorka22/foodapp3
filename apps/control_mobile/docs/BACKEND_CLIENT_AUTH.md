# Staff login `client` for FoodApp Control

FoodApp Control calls:

- `POST /auth/login`
- Body: `email` **or** `phone`, `password`, and **`client: "control"`**
- Response: `{ accessToken, user: { id, email, phone?, fullName, role } }`

## Server policy (NestJS)

When `client` is `control`, only `SUPER_ADMIN` may receive a JWT.
Other roles receive HTTP 403. Unknown `client` values receive HTTP 400.

The `client` field is self-asserted by the app at login time. It is **not**
cryptographic proof of which binary sent later API requests. Endpoint
authorization still uses JWT role + `@Roles`.

## Client storage

Session keys (must not collide with Business/Courier/Customer):

- secure: `control_access_token`
- prefs: `control_user_json`
