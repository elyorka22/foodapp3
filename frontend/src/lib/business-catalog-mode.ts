/** All merchants use catalog menu (products + cart). */
export type BusinessCatalogMode = 'CATALOG';

export function isCatalogMode(_mode?: string | null): boolean {
  return true;
}

export function catalogModeLabel(_mode?: string | null): string {
  return 'Menyu (mahsulotlar + savat)';
}
