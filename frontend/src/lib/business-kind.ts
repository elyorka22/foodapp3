export type BusinessKind = 'RESTAURANT' | 'STORE';
export type BusinessMenuMode = 'GLOBAL_DISH' | 'OWN_CATEGORIES';

export function isRestaurantKind(
  kind?: string | null,
  typeSlug?: string | null,
  businessTypeId?: string | null,
  menuMode?: string | null,
): boolean {
  if (menuMode === 'GLOBAL_DISH') return true;
  if (menuMode === 'OWN_CATEGORIES') return false;
  if (typeSlug === 'restaurant') return true;
  if (businessTypeId == null && typeSlug == null) return true;
  return kind === 'RESTAURANT';
}

export function isStoreKind(
  kind?: string | null,
  typeSlug?: string | null,
  businessTypeId?: string | null,
  menuMode?: string | null,
): boolean {
  return !isRestaurantKind(kind, typeSlug, businessTypeId, menuMode);
}

/** Marketplace merchants only (excludes restaurants for home banner / shops list). */
export function filterStoreBusinesses<
  T extends {
    kind?: string | null;
    businessType?: { slug?: string | null; menuMode?: string | null } | null;
  },
>(items: T[]): T[] {
  return items.filter((b) =>
    isStoreKind(b.kind, b.businessType?.slug, undefined, b.businessType?.menuMode),
  );
}
