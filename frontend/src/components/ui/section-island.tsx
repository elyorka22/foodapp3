'use client';

import { clsx } from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Inner padding. Use false for full-bleed media (banners). */
  padded?: boolean;
} & React.HTMLAttributes<HTMLElement>;

/** Minimal gray gap between stacked islands. */
export const SECTION_ISLAND_GAP = 'mt-1.5';

/**
 * White island with side inset (Perekrestok-style floating plate).
 * Header (city + bell) stays outside — only content blocks use this.
 */
export function SectionIsland({
  children,
  className,
  padded = true,
  ...props
}: Props) {
  return (
    <section
      className={clsx(
        'mx-3 overflow-hidden rounded-[24px] bg-white',
        padded && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
