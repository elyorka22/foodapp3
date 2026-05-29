/** Per-route throttle profiles (ttl in ms). */
export const THROTTLE = {
  AUTH_LOGIN: { limit: 10, ttl: 900_000 },
  CUSTOMER_AUTH: { limit: 15, ttl: 900_000 },
  GUEST_ORDER: { limit: 20, ttl: 3_600_000 },
  PROMO_VALIDATE: { limit: 40, ttl: 3_600_000 },
  TRACK_ORDER: { limit: 120, ttl: 60_000 },
} as const;
