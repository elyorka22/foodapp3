/** Format coordinates for display */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function yandexMapsUrl(lat: number, lng: number): string {
  return `https://yandex.com/maps/?pt=${lng},${lat}&z=17&l=map`;
}

export function isValidCoords(lat: number | null, lng: number | null): boolean {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
