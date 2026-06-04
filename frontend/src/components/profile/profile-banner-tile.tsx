'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  heroText?: string;
  heroClassName?: string;
  variant?: 'light' | 'accent';
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  className?: string;
};

export function ProfileBannerTile({
  title,
  subtitle,
  heroText,
  heroClassName,
  variant = 'light',
  href,
  onClick,
  icon: Icon,
  className,
}: Props) {
  const accent = variant === 'accent';
  const inner = (
    <div
      className={clsx(
        'relative flex min-h-[148px] flex-col rounded-3xl p-4 transition active:scale-[0.98]',
        accent ? 'bg-[#3B5245] text-white' : 'bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      <div className="min-w-0">
        <p className={clsx('text-base font-bold leading-tight', accent && 'text-white')}>{title}</p>
        {subtitle ? (
          <p
            className={clsx(
              'mt-1 text-xs leading-snug',
              accent ? 'text-white/85' : 'text-zinc-400',
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {heroText ? (
        <p
          className={clsx(
            'mt-auto text-[28px] font-extrabold leading-none',
            heroClassName ?? (accent ? 'text-white' : 'text-[#2F5A40]'),
          )}
        >
          {heroText}
        </p>
      ) : null}
      {Icon ? (
        <Icon
          className={clsx(
            'pointer-events-none absolute bottom-3 right-3',
            accent ? 'text-white/90' : 'text-zinc-400',
          )}
          size={accent ? 48 : 40}
          strokeWidth={accent ? 1.5 : 1.75}
        />
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block" onClick={onClick}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className="block w-full text-left" onClick={onClick}>
        {inner}
      </button>
    );
  }

  return <div className="block">{inner}</div>;
}
