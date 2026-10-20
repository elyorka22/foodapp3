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
};

export type HomeServiceCards = Record<HomeServiceCardKey, HomeServiceCardLayout>;

export const DEFAULT_HOME_SERVICE_CARDS: HomeServiceCards = {
  flowers: {
    imageUrl: '/assets/home-services/flowers.png',
    widthPercent: 112,
    right: -18,
    bottom: -22,
  },
  cosmetics: {
    imageUrl: '/assets/home-services/cosmetics.png',
    widthPercent: 110,
    right: -18,
    bottom: -22,
  },
  pharmacy: {
    imageUrl: '/assets/home-services/pharmacy.png',
    widthPercent: 112,
    right: -18,
    bottom: -22,
  },
  restaurants: {
    imageUrl: '/assets/home-services/restaurants.png',
    widthPercent: 95,
    right: -20,
    bottom: -24,
  },
  products: {
    imageUrl: '/assets/home-services/products.png',
    widthPercent: 108,
    right: -16,
    bottom: -22,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function mergeHomeServiceCard(
  key: HomeServiceCardKey,
  override?: Partial<HomeServiceCardLayout> | null,
): HomeServiceCardLayout {
  const base = DEFAULT_HOME_SERVICE_CARDS[key];
  if (!override) return base;
  const imageUrl =
    typeof override.imageUrl === 'string' && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : base.imageUrl;
  return {
    imageUrl,
    widthPercent: clamp(
      Number(override.widthPercent ?? base.widthPercent),
      40,
      160,
    ),
    right: clamp(Number(override.right ?? base.right), -80, 40),
    bottom: clamp(Number(override.bottom ?? base.bottom), -80, 40),
  };
}
