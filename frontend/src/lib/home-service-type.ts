import type { BusinessType } from '@/lib/api/business';
import {
  DEFAULT_HOME_SERVICE_CARDS,
  mergeHomeServiceCard,
  type HomeServiceCardKey,
  type HomeServiceCardLayout,
  type HomeServiceCards,
} from '@/lib/home-service-cards';

/** Map business-type slug → legacy home_service_cards key for image framing. */
export function homeServiceKeyForSlug(slug: string): HomeServiceCardKey | null {
  const s = slug.toLowerCase();
  if (s === 'flowers') return 'flowers';
  if (s === 'perfume' || s === 'cosmetics') return 'cosmetics';
  if (s === 'pharmacy') return 'pharmacy';
  if (s === 'restaurant' || s === 'restaurants') return 'restaurants';
  if (s === 'grocery' || s === 'products') return 'products';
  return null;
}

export function isRestaurantHomeType(type: Pick<BusinessType, 'slug' | 'menuMode'>) {
  return (
    type.menuMode === 'GLOBAL_DISH' ||
    (type.slug ?? '').toLowerCase() === 'restaurant'
  );
}

export function homeHrefForType(type: Pick<BusinessType, 'slug' | 'menuMode'>) {
  if (isRestaurantHomeType(type)) return '/restaurants';
  return `/stores/${encodeURIComponent(type.slug)}`;
}

export function layoutForBusinessType(
  type: Pick<BusinessType, 'slug' | 'imageUrl'>,
  settingsCards?: Partial<HomeServiceCards> | null,
): HomeServiceCardLayout {
  const key = homeServiceKeyForSlug(type.slug);
  const base = key
    ? mergeHomeServiceCard(key, settingsCards?.[key])
    : {
        ...DEFAULT_HOME_SERVICE_CARDS.products,
        imageUrl: '',
      };
  const custom = type.imageUrl?.trim();
  if (custom) {
    return { ...base, imageUrl: custom };
  }
  return base;
}

export function splitHomeGridTypes(types: BusinessType[]) {
  const sorted = [...types].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const row1 = sorted.filter((t) => (t.homeGridRow ?? 1) === 1);
  const row2 = sorted.filter((t) => (t.homeGridRow ?? 1) === 2);
  const restaurant = row2.find((t) => isRestaurantHomeType(t)) ?? null;
  const row2Others = row2.filter((t) => t.id !== restaurant?.id);
  return { row1, restaurant, row2Others };
}
