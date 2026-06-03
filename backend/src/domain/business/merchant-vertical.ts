import { Prisma } from '@prisma/client';

/** Restaurant = food delivery; Store = marketplace merchants (grocery, pharmacy, …). */
export type MerchantVertical = 'restaurant' | 'store';

export function businessWhereForVertical(
  vertical?: MerchantVertical,
): Prisma.BusinessWhereInput | undefined {
  if (!vertical) return undefined;

  if (vertical === 'restaurant') {
    return {
      OR: [{ businessTypeId: null }, { businessType: { slug: 'restaurant' } }],
    };
  }

  return {
    businessTypeId: { not: null },
    NOT: { businessType: { slug: 'restaurant' } },
  };
}

export function orderWhereForVertical(
  vertical?: MerchantVertical,
): Prisma.OrderWhereInput | undefined {
  const business = businessWhereForVertical(vertical);
  if (!business) return undefined;
  return { business };
}
