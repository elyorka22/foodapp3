/** Public customer route for a restaurant (slug preferred, id fallback for API). */
export function restaurantPublicPath(restaurant: { id: string; slug?: string | null }): string {
  const slug = restaurant.slug?.trim();
  if (slug) return `/restaurants/${encodeURIComponent(slug)}`;
  return `/restaurants/${restaurant.id}`;
}
