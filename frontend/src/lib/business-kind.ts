export type BusinessKind = 'RESTAURANT' | 'STORE';

export function isRestaurantKind(kind?: string | null, typeSlug?: string | null): boolean {
  return kind === 'RESTAURANT' || typeSlug === 'restaurant';
}

export function isStoreKind(kind?: string | null, typeSlug?: string | null): boolean {
  if (kind === 'STORE') return true;
  if (kind === 'RESTAURANT') return false;
  return typeSlug !== 'restaurant' && typeSlug != null;
}
