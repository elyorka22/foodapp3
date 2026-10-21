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

/**
 * CSS for framed cover images: zoom + focal point.
 *
 * Scale is zoom-in only (100–200%). Values below 100 used to shrink the bitmap
 * inside the tile and left sharp rectangular corners on the muted background.
 * Category tiles that letterbox should pass `fit: 'contain'` (no transform).
 */
export function categoryImageStyle(
  framing: CategoryImageFraming,
  options: StyleOptions = {},
): CSSProperties {
  const fit = options.fit ?? 'cover';
  const x = clamp(framing.imagePositionX ?? 50, 0, 100);
  const y = clamp(framing.imagePositionY ?? 50, 0, 100);
  if (fit === 'contain') {
    return {
      objectFit: 'contain',
      objectPosition: coverObjectPosition(x, y),
    };
  }
  // Cover: always fill the rounded clip; scale ≥ 1 crops more of the photo.
  const scale = clamp(framing.imageScale ?? 100, 100, 200) / 100;
  return {
    objectFit: 'cover',
    objectPosition: coverObjectPosition(x, y),
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}
