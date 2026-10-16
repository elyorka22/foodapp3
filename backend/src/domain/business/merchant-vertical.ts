import { BusinessMenuMode, Prisma } from '@prisma/client';

/** Restaurant = food delivery; Store = marketplace merchants (grocery, pharmacy, …). */
export type MerchantVertical = 'restaurant' | 'store';

/**
 * Vertical filter based on BusinessType.menuMode (with legacy kind/slug fallback).
 */
export function businessWhereForVertical(
  vertical?: MerchantVertical,
): Prisma.BusinessWhereInput | undefined {
  if (!vertical) return undefined;

  if (vertical === 'restaurant') {
    return {
      OR: [
        { businessType: { menuMode: BusinessMenuMode.GLOBAL_DISH } },
        // Legacy rows without a type
        { businessTypeId: null },
      ],
    };
  }

  return {
    businessType: { menuMode: BusinessMenuMode.OWN_CATEGORIES },
  };
}

export function orderWhereForVertical(
  vertical?: MerchantVertical,
): Prisma.OrderWhereInput | undefined {
  const business = businessWhereForVertical(vertical);
  if (!business) return undefined;
  return { business };
}
