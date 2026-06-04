export type BusinessKind = 'RESTAURANT' | 'STORE';

export function isRestaurantKind(kind?: string | null, typeSlug?: string | null): boolean {
  return kind === 'RESTAURANT' || typeSlug === 'restaurant';
}

export function isStoreKind(kind?: string | null, typeSlug?: string | null): boolean {
  if (kind === 'RESTAURANT') return false;
  if (kind === 'STORE') return true;
  return typeSlug !== 'restaurant' && typeSlug != null;
}

/** Marketplace merchants only (excludes restaurants for home banner / shops list). */
export function filterStoreBusinesses<T extends { kind?: string | null; businessType?: { slug?: string | null } | null }>(
  items: T[],
): T[] {
  return items.filter((b) => isStoreKind(b.kind, b.businessType?.slug));
}
