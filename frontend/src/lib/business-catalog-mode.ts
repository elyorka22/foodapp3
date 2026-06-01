export type BusinessCatalogMode = 'CATALOG' | 'CONTACT';

export function isCatalogMode(mode?: string | null): boolean {
  return mode !== 'CONTACT';
}

export function catalogModeLabel(mode?: string | null): string {
  return mode === 'CONTACT' ? 'Kontakt (logo + telefon)' : 'Katalog (menyu + savat)';
}
