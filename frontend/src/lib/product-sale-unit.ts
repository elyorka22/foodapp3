export const PRODUCT_SALE_UNITS = ['dona', 'gr', 'kg', 'karobka'] as const;

export type ProductSaleUnit = (typeof PRODUCT_SALE_UNITS)[number];

export const PRODUCT_SALE_UNIT_LABELS: Record<ProductSaleUnit, string> = {
  dona: 'dona',
  gr: 'gr',
  kg: 'kg',
  karobka: 'karobka',
};

export function normalizeSaleUnit(value?: string | null): ProductSaleUnit {
  if (value && PRODUCT_SALE_UNITS.includes(value as ProductSaleUnit)) {
    return value as ProductSaleUnit;
  }
  return 'dona';
}
