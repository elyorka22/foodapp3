const STORAGE_KEY = 'foodapp_selected_city_slug';

export function getSelectedCitySlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setSelectedCitySlug(slug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, slug);
}
