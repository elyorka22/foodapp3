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

export type CategoryImageFit = 'cover' | 'contain';

type StyleOptions = {
  /** `contain` letterboxes on white; `cover` crops to fill (default). */
  fit?: CategoryImageFit;
};

/** CSS for framed images: zoom + focal point. Category tiles use `fit: 'contain'`. */
export function categoryImageStyle(
  framing: CategoryImageFraming,
  options: StyleOptions = {},
): CSSProperties {
  const fit = options.fit ?? 'cover';
  const scale = clamp(framing.imageScale ?? 100, 50, 200) / 100;
  const x = clamp(framing.imagePositionX ?? 50, 0, 100);
  const y = clamp(framing.imagePositionY ?? 50, 0, 100);
  return {
    objectFit: fit,
    objectPosition: coverObjectPosition(x, y),
    transform: `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
