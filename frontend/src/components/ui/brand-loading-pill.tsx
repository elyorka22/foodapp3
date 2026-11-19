'use client';

import { clsx } from 'clsx';

type Props = {
  className?: string;
  /** Defaults to screenshot-style «Loading..». */
  label?: string;
  size?: 'md' | 'lg';
};

/**
 * Dark pill loader with brand wing mark + diagonal shimmer
 * (home-nav logo from `/brand-wing.png`).
 */
export function BrandLoadingPill({
  className,
  label = 'Loading..',
  size = 'md',
}: Props) {
  const pad = size === 'lg' ? 'px-7 py-3.5 gap-3' : 'px-6 py-3 gap-2.5';
  const icon = size === 'lg' ? 28 : 24;
  const text = size === 'lg' ? 'text-[17px]' : 'text-[15px]';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={clsx(
        'brand-loading-pill relative inline-flex items-center overflow-hidden rounded-full bg-[#2A2A2E] text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]',
        pad,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-wing.png"
        alt=""
        width={icon}
        height={icon}
        draggable={false}
        className="relative z-[1] shrink-0 select-none object-contain"
      />
      <span className={clsx('relative z-[1] font-semibold tracking-tight', text)}>
        {label}
      </span>
      <span className="brand-loading-pill__shimmer pointer-events-none absolute inset-0" aria-hidden />
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
      <BrandLoadingPill label={label} />
    </div>
  );
}
