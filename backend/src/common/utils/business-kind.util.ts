import { BusinessKind } from '@prisma/client';

type BusinessLike = {
  kind?: BusinessKind | string | null;
  businessTypeId?: string | null;
  businessType?: { slug?: string | null } | null;
};

export function resolveBusinessKind(row: BusinessLike): BusinessKind {
  if (row.businessType?.slug === 'restaurant') {
    return BusinessKind.RESTAURANT;
  }
  // Admin restaurant flow: no marketplace type selected.
  if (row.businessTypeId == null && !row.businessType) {
    return BusinessKind.RESTAURANT;
  }
  if (row.kind === BusinessKind.RESTAURANT) {
    return BusinessKind.RESTAURANT;
  }
  return BusinessKind.STORE;
}

export function isRestaurantKind(row: BusinessLike): boolean {
  return resolveBusinessKind(row) === BusinessKind.RESTAURANT;
}

export function isStoreKind(row: BusinessLike): boolean {
  return resolveBusinessKind(row) === BusinessKind.STORE;
}
