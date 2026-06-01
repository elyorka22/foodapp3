import type { CSSProperties } from 'react';
import { coverObjectPosition } from '@/lib/cover-position';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

export type CategoryImageFraming = {
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
};

/** CSS for category images: object-fit cover + admin-controlled zoom and focal point. */
export function categoryImageStyle(framing: CategoryImageFraming): CSSProperties {
  const scale = clamp(framing.imageScale ?? 100, 50, 200) / 100;
  const x = clamp(framing.imagePositionX ?? 50, 0, 100);
  const y = clamp(framing.imagePositionY ?? 50, 0, 100);
  return {
    objectFit: 'cover',
    objectPosition: coverObjectPosition(x, y),
    transform: `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
