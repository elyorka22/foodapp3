'use client';

import { clsx } from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Inner padding. Use false for full-bleed media (banners). */
  padded?: boolean;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Pyaterochka-style white “island” on gray page background.
 * Each major home/store block sits in its own rounded plate.
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
        'overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        padded && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
