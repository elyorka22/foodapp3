/** CSS object-position from admin sliders (0–100). */
export function coverObjectPosition(x?: number | null, y?: number | null): string {
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  return `${clamp(x ?? 50)}% ${clamp(y ?? 50)}%`;
}
