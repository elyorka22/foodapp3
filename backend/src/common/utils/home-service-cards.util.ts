/** Keys match customer home service tiles (web HomeServiceGrid). */
export const HOME_SERVICE_CARD_KEYS = [
  'flowers',
  'cosmetics',
  'pharmacy',
  'restaurants',
  'products',
] as const;

export type HomeServiceCardKey = (typeof HOME_SERVICE_CARD_KEYS)[number];

export type HomeServiceCardLayout = {
  imageUrl: string;
  widthPercent: number;
  right: number;
  bottom: number;
  /** Degrees, negative = counter-clockwise (slight tilt). */
  rotate: number;
};

export type HomeServiceCards = Record<HomeServiceCardKey, HomeServiceCardLayout>;

export const DEFAULT_HOME_SERVICE_CARDS: HomeServiceCards = {
  flowers: {
    imageUrl: '/assets/home-services/flowers.png',
    widthPercent: 112,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  cosmetics: {
    imageUrl: '/assets/home-services/cosmetics.png',
    widthPercent: 110,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  pharmacy: {
    imageUrl: '/assets/home-services/pharmacy.png',
    widthPercent: 112,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  restaurants: {
    imageUrl: '/assets/home-services/restaurants.png',
    widthPercent: 95,
    right: -20,
    bottom: -24,
    rotate: 0,
  },
  products: {
    imageUrl: '/assets/home-services/products.png',
    widthPercent: 108,
    right: -16,
    bottom: -22,
    rotate: 0,
  },
};

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function normalizeCard(
  key: HomeServiceCardKey,
  raw: unknown,
): HomeServiceCardLayout {
  const base = DEFAULT_HOME_SERVICE_CARDS[key];
  const obj =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const imageUrl =
    typeof obj.imageUrl === 'string' && obj.imageUrl.trim()
      ? obj.imageUrl.trim()
      : base.imageUrl;
  return {
    imageUrl,
    widthPercent: clamp(asNumber(obj.widthPercent, base.widthPercent), 40, 160),
    right: clamp(asNumber(obj.right, base.right), -80, 40),
    bottom: clamp(asNumber(obj.bottom, base.bottom), -80, 40),
    rotate: clamp(asNumber(obj.rotate, base.rotate), -30, 30),
  };
}

/** Merge partial admin JSON over defaults; always returns a full map. */
export function normalizeHomeServiceCards(raw: unknown): HomeServiceCards {
  const obj =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out = {} as HomeServiceCards;
  for (const key of HOME_SERVICE_CARD_KEYS) {
    out[key] = normalizeCard(key, obj[key]);
  }
  return out;
}
