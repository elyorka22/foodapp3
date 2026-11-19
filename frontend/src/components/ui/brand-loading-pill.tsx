'use client';

import { clsx } from 'clsx';

type Props = {
  className?: string;
  /** Accessible label only (not shown). */
  label?: string;
  size?: 'md' | 'lg';
};

/**
 * Brand wing mark with a spinning ring around it
 * (same logo as home-nav `/brand-wing.png`).
 */
export function BrandLoadingPill({
  className,
  label = 'Loading..',
  size = 'md',
}: Props) {
  const box = size === 'lg' ? 72 : 56;
  const icon = size === 'lg' ? 36 : 28;
  const stroke = size === 'lg' ? 3 : 2.5;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={clsx(
        'brand-loading-ring relative inline-flex items-center justify-center',
        className,
      )}
      style={{ width: box, height: box }}
    >
      <svg
        className="brand-loading-ring__spin absolute inset-0"
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        fill="none"
        aria-hidden
      >
        <circle
          cx={box / 2}
          cy={box / 2}
          r={(box - stroke) / 2}
          stroke="rgba(74, 5, 202, 0.15)"
          strokeWidth={stroke}
          pathLength={100}
        />
        <circle
          className="brand-loading-ring__arc"
          cx={box / 2}
          cy={box / 2}
          r={(box - stroke) / 2}
          stroke="#4A05CA"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-wing.png"
        alt=""
        width={icon}
        height={icon}
        draggable={false}
        className="relative z-[1] select-none object-contain"
      />
    </div>
  );
}

/** Centered full-block loader for page / section loading states. */
export function BrandLoadingState({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={clsx(
        'flex min-h-[12rem] w-full items-center justify-center',
        className,
      )}
    >
      <BrandLoadingPill label={label} size="lg" />
    </div>
  );
}
