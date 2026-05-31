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

/** Resolve address to coordinates for manual delivery (not shown to user). */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const query = address.trim();
  if (!query) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'FoodApp-Delivery/1.0' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!isValidCoords(lat, lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
