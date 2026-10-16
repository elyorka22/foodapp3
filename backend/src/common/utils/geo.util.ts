/** Haversine distance in kilometers. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Ring = number[][];

/** Ray-casting point-in-polygon. Ring is [[lng, lat], ...] (GeoJSON order). */
export function pointInPolygon(lat: number, lng: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]);
    const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]);
    const yj = Number(ring[j][1]);
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function asRing(value: unknown): Ring | null {
  if (!Array.isArray(value) || !value.length) return null;
  if (!Array.isArray(value[0])) return null;
  return value as Ring;
}

/**
 * GeoJSON Polygon/MultiPolygon or a bare ring [[lng,lat],...].
 */
export function pointInGeoJson(
  lat: number,
  lng: number,
  polygon: unknown,
): boolean {
  if (!polygon || typeof polygon !== 'object') return false;

  if (Array.isArray(polygon)) {
    const ring = asRing(polygon);
    return ring ? pointInPolygon(lat, lng, ring) : false;
  }

  const p = polygon as { type?: string; coordinates?: unknown };

  if (p.type === 'Polygon') {
    const coords = p.coordinates as unknown[] | undefined;
    const ring = asRing(coords?.[0]);
    return ring ? pointInPolygon(lat, lng, ring) : false;
  }

  if (p.type === 'MultiPolygon' && Array.isArray(p.coordinates)) {
    return (p.coordinates as unknown[]).some((poly) => {
      const ring = asRing(Array.isArray(poly) ? poly[0] : null);
      return ring ? pointInPolygon(lat, lng, ring) : false;
    });
  }

  const coords = p.coordinates as unknown[] | undefined;
  const ring = asRing(coords?.[0]);
  return ring ? pointInPolygon(lat, lng, ring) : false;
}
