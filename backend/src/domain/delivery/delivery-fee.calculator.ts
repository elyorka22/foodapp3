/** Round delivery fee to nearest 500 UZS (12900 → 13000). */
export function roundDeliveryFeeToNearest500(amount: number): number {
  return Math.round(amount / 500) * 500;
}

/**
 * Customer delivery fee: distance × price per km, rounded to nearest 500 UZS.
 * Settings changes do not affect orders already placed (fee stored on Order).
 */
export function calculateCustomerDeliveryFee(
  distanceKm: number,
  pricePerKm: number,
): number {
  const raw = distanceKm * pricePerKm;
  return roundDeliveryFeeToNearest500(raw);
}
