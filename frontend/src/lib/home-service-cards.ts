export type HomeServiceCardKey =
  | 'flowers'
  | 'cosmetics'
  | 'pharmacy'
  | 'restaurants'
  | 'products';

export type HomeServiceCardLayout = {
  imageUrl: string;
  widthPercent: number;
  right: number;
  bottom: number;
  /** Degrees — negative tilts counter-clockwise. */
  rotate: number;
};

export type HomeServiceCards = Record<HomeServiceCardKey, HomeServiceCardLayout>;

/** Bust stale PWA/CDN caches of mislabeled WebP-as-PNG files. */
const ASSET_VER = 'v5';

function defaultAsset(file: string): string {
  return `/assets/home-services/${file}?${ASSET_VER}`;
}

export const DEFAULT_HOME_SERVICE_CARDS: HomeServiceCards = {
  flowers: {
    imageUrl: defaultAsset('flowers.png'),
    widthPercent: 112,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  cosmetics: {
    imageUrl: defaultAsset('cosmetics.png'),
    widthPercent: 110,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  pharmacy: {
    imageUrl: defaultAsset('pharmacy.png'),
    widthPercent: 112,
    right: -18,
    bottom: -22,
    rotate: 0,
  },
  restaurants: {
    imageUrl: defaultAsset('restaurants.png'),
    widthPercent: 95,
    right: -20,
    bottom: -24,
    rotate: 0,
  },
  products: {
    imageUrl: defaultAsset('products.png'),
    widthPercent: 108,
    right: -16,
    bottom: -22,
    rotate: 0,
  },
};

/** Make relative asset paths absolute so PWA / deep links still load them. */
export function resolveHomeServiceImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (typeof window === 'undefined') return trimmed;
  try {
    return new URL(trimmed, window.location.origin).href;
  } catch {
    return trimmed;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function mergeHomeServiceCard(
  key: HomeServiceCardKey,
  override?: Partial<HomeServiceCardLayout> | null,
): HomeServiceCardLayout {
  const base = DEFAULT_HOME_SERVICE_CARDS[key];
  if (!override) return base;
  let imageUrl =
    typeof override.imageUrl === 'string' && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : base.imageUrl;
  // Default static paths always carry a cache-bust query.
  if (
    imageUrl.startsWith('/assets/home-services/') &&
    !imageUrl.includes('?')
  ) {
    imageUrl = `${imageUrl}?${ASSET_VER}`;
  }
  return {
    imageUrl,
    widthPercent: clamp(
      Number(override.widthPercent ?? base.widthPercent),
      40,
      160,
    ),
    right: clamp(Number(override.right ?? base.right), -80, 40),
    bottom: clamp(Number(override.bottom ?? base.bottom), -80, 40),
    rotate: clamp(Number(override.rotate ?? base.rotate), -30, 30),
  };
}
