import type { CSSProperties } from 'react';

const SQUARE_ASPECT_MIN = 0.88;
const SQUARE_ASPECT_MAX = 1.14;

/** Auto framing for dish photos in square menu cards (portrait/landscape → contain). */
export function menuProductImageStyle(
  naturalWidth: number,
  naturalHeight: number,
): CSSProperties {
  if (!naturalWidth || !naturalHeight) {
    return { objectFit: 'cover', objectPosition: 'center' };
  }

  const aspect = naturalWidth / naturalHeight;
  if (aspect >= SQUARE_ASPECT_MIN && aspect <= SQUARE_ASPECT_MAX) {
    return { objectFit: 'cover', objectPosition: 'center' };
  }

  return { objectFit: 'contain', objectPosition: 'center' };
}
