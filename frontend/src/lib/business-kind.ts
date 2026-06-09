export type BusinessKind = 'RESTAURANT' | 'STORE';

export function isRestaurantKind(
  kind?: string | null,
  typeSlug?: string | null,
  businessTypeId?: string | null,
): boolean {
  if (typeSlug === 'restaurant') return true;
  if (businessTypeId == null && typeSlug == null) return true;
  return kind === 'RESTAURANT';
}

export function isStoreKind(
  kind?: string | null,
  typeSlug?: string | null,
  businessTypeId?: string | null,
): boolean {
  return !isRestaurantKind(kind, typeSlug, businessTypeId);
}

/** Marketplace merchants only (excludes restaurants for home banner / shops list). */
export function filterStoreBusinesses<T extends { kind?: string | null; businessType?: { slug?: string | null } | null }>(
  items: T[],
): T[] {
  return items.filter((b) => isStoreKind(b.kind, b.businessType?.slug));
}
