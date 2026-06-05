/** Round delivery fee to nearest 500 UZS (12900 → 13000). */
export function roundDeliveryFeeToNearest500(amount: number): number {
  return Math.round(amount / 500) * 500;
}

export type CustomerDeliveryFeeOptions = {
  roadDistanceFactor?: number;
  minDeliveryFee?: number;
  baseFee?: number;
};

/** Straight-line km adjusted for typical road distance (no routing API). */
export function calculateBillableDistanceKm(
  straightLineKm: number,
  roadDistanceFactor = 1,
): number {
  return Math.round(straightLineKm * roadDistanceFactor * 100) / 100;
}

/**
 * Customer delivery fee: billable distance × price per km, rounded to nearest 500 UZS.
 * Billable distance = straight-line Haversine × roadDistanceFactor.
 */
export function calculateCustomerDeliveryFee(
  straightLineDistanceKm: number,
  pricePerKm: number,
  options: CustomerDeliveryFeeOptions = {},
): number {
  const factor = options.roadDistanceFactor ?? 1;
  const billableKm = calculateBillableDistanceKm(straightLineDistanceKm, factor);
  const raw = (options.baseFee ?? 0) + billableKm * pricePerKm;
  const rounded = roundDeliveryFeeToNearest500(raw);
  const min = options.minDeliveryFee ?? 0;
  return Math.max(min, rounded);
}
