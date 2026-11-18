'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  trailing?: string;
  trailingClassName?: string;
  showDivider?: boolean;
};

export function ProfileMenuRow({
  icon: Icon,
  label,
  hint,
  href,
  onClick,
  trailing,
  trailingClassName,
  showDivider = true,
}: Props) {
  const className = clsx(
    'flex min-h-[56px] w-full items-center gap-3.5 px-4 py-3 text-left transition active:bg-zinc-50',
    showDivider && 'border-b border-zinc-100',
  );

  const inner = (
    <>
      <Icon size={22} strokeWidth={1.75} className="shrink-0 text-zinc-800" />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-medium leading-snug text-zinc-900">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-[12px] leading-4 text-zinc-400">{hint}</p>
        ) : null}
      </div>
      {trailing ? (
        <span
          className={clsx(
            'shrink-0 text-[14px] font-semibold text-emerald-600',
            trailingClassName,
          )}
        >
          {trailing}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
