'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  iconClassName?: string;
  onClick?: () => void;
  href?: string;
};

export function ProfileMenuRow({
  icon: Icon,
  label,
  hint,
  iconClassName,
  onClick,
  href,
}: Props) {
  const className = clsx(
    'flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition active:bg-background',
  );

  const inner = (
    <>
      <div
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-foreground',
          iconClassName,
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-4 text-foreground-muted">{hint}</p>}
      </div>
      <ChevronRight size={18} className="shrink-0 text-[#D1D5DB]" />
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
