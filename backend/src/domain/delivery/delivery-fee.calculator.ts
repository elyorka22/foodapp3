/** Round delivery fee to nearest 500 UZS (12900 → 13000). */
export function roundDeliveryFeeToNearest500(amount: number): number {
  return Math.round(amount / 500) * 500;
}

/** Road correction factor applied to straight-line Haversine distance. */
export const DELIVERY_ROAD_FACTOR = 1.3;

/** Straight-line km adjusted for typical road distance (no routing API). */
export function calculateBillableDistanceKm(straightLineKm: number): number {
  return Math.round(straightLineKm * DELIVERY_ROAD_FACTOR * 100) / 100;
}

/**
 * Customer delivery fee:
 * distanceKm = haversine × 1.3
 * deliveryFee = baseDeliveryFee + (distanceKm × perKmFee), rounded to nearest 500 UZS
 */
export function calculateCustomerDeliveryFee(
  straightLineDistanceKm: number,
  perKmFee: number,
  baseDeliveryFee = 0,
): number {
  const distanceKm = calculateBillableDistanceKm(straightLineDistanceKm);
  const raw = baseDeliveryFee + distanceKm * perKmFee;
  return roundDeliveryFeeToNearest500(raw);
}
