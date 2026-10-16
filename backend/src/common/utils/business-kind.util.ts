import { BusinessKind, BusinessMenuMode } from '@prisma/client';

type BusinessLike = {
  kind?: BusinessKind | string | null;
  businessTypeId?: string | null;
  businessType?: {
    slug?: string | null;
    menuMode?: BusinessMenuMode | string | null;
  } | null;
};

/**
 * Source of truth: BusinessType.menuMode.
 * `Business.kind` is a denormalized cache — only used as last-resort legacy fallback.
 */
export function resolveMenuMode(
  row: BusinessLike,
): BusinessMenuMode {
  const mode = row.businessType?.menuMode;
  if (mode === BusinessMenuMode.GLOBAL_DISH || mode === 'GLOBAL_DISH') {
    return BusinessMenuMode.GLOBAL_DISH;
  }
  if (mode === BusinessMenuMode.OWN_CATEGORIES || mode === 'OWN_CATEGORIES') {
    return BusinessMenuMode.OWN_CATEGORIES;
  }
  // Legacy rows without menuMode
  if (row.businessTypeId == null && !row.businessType) {
    return BusinessMenuMode.GLOBAL_DISH;
  }
  if (row.kind === BusinessKind.RESTAURANT || row.kind === 'RESTAURANT') {
    return BusinessMenuMode.GLOBAL_DISH;
  }
  return BusinessMenuMode.OWN_CATEGORIES;
}

export function resolveBusinessKind(row: BusinessLike): BusinessKind {
  return resolveMenuMode(row) === BusinessMenuMode.GLOBAL_DISH
    ? BusinessKind.RESTAURANT
    : BusinessKind.STORE;
}

export function isRestaurantKind(row: BusinessLike): boolean {
  return resolveBusinessKind(row) === BusinessKind.RESTAURANT;
}

export function isStoreKind(row: BusinessLike): boolean {
  return resolveBusinessKind(row) === BusinessKind.STORE;
}

export function usesGlobalDishMenu(row: BusinessLike): boolean {
  return resolveMenuMode(row) === BusinessMenuMode.GLOBAL_DISH;
}

export function usesOwnProductCategories(row: BusinessLike): boolean {
  return resolveMenuMode(row) === BusinessMenuMode.OWN_CATEGORIES;
}

export function kindFromMenuMode(menuMode: BusinessMenuMode): BusinessKind {
  return menuMode === BusinessMenuMode.GLOBAL_DISH
    ? BusinessKind.RESTAURANT
    : BusinessKind.STORE;
}
