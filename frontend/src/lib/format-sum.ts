/** Format amount in Uzbek so'm (UZS) with spaced thousands: 35 000 so'm */
export function formatSum(amount: number | string | null | undefined): string {
  const n = Math.round(Number(amount ?? 0));
  if (!Number.isFinite(n)) return "0 so'm";
  const spaced = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = n < 0 ? '−' : '';
  return `${sign}${spaced} so'm`;
}
