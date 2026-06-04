import { uz } from '@/lib/uz';

type CategoryLike = { name: string };

type RestaurantMeta = {
  avgPrepMinutes?: number;
  deliveryMinutes?: number;
  averageRating?: number;
  reviewCount?: number;
  categories?: CategoryLike[];
  productCategories?: CategoryLike[];
};

export function restaurantPrepMinutes(r: RestaurantMeta): number {
  return r.deliveryMinutes ?? r.avgPrepMinutes ?? 30;
}

export function restaurantDeliveryLabel(r: RestaurantMeta): string {
  const base = restaurantPrepMinutes(r);
  const low = Math.max(15, base - 5);
  const high = base + 5;
  return uz.deliveryTime(`${low} – ${high} ${uz.min}`);
}

export function restaurantCategoryLabel(r: RestaurantMeta): string {
  const cats = r.productCategories ?? r.categories ?? [];
  return cats
    .map((c) => c.name.trim())
    .filter(Boolean)
    .join(', ');
}

export function restaurantRatingLabel(r: RestaurantMeta): string | null {
  const rating = r.averageRating;
  if (rating == null || Number.isNaN(Number(rating))) return null;
  const value = Number(rating).toFixed(1);
  const count = r.reviewCount ?? 0;
  return `★ ${value} (${count})`;
}
