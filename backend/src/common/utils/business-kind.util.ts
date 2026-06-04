import { BusinessKind } from '@prisma/client';

type BusinessLike = {
  kind?: BusinessKind | string | null;
  businessType?: { slug?: string | null } | null;
};

export function resolveBusinessKind(row: BusinessLike): BusinessKind {
  if (row.kind === BusinessKind.RESTAURANT || row.kind === BusinessKind.STORE) {
    return row.kind;
  }
  if (row.businessType?.slug === 'restaurant') {
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
