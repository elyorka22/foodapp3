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
  const scale = clamp(framing.imageScale ?? 100, 100, 200) / 100;
  return {
    objectFit: fit,
    objectPosition: coverObjectPosition(x, y),
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

/**
 * Pan + zoom for square-ish tiles (store categories).
 *
 * The image is clipped by the tile: left/top move it so part can sit outside
 * the rounded frame (only the visible slice remains). Scale is independent —
 * only the Masshtab slider changes zoom.
 */
export function categoryImagePanStyle(
  framing: CategoryImageFraming,
): CSSProperties {
  const scale = clamp(framing.imageScale ?? 100, 100, 200) / 100;
  const x = clamp(framing.imagePositionX ?? 50, 0, 100);
  const y = clamp(framing.imagePositionY ?? 50, 0, 100);
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    objectFit: 'cover',
  };
}
