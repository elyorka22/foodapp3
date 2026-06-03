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
  badge?: number;
};

export function ProfileMenuRow({
  icon: Icon,
  label,
  hint,
  iconClassName,
  onClick,
  href,
  badge,
}: Props) {
  const className = clsx(
    'flex min-h-[52px] w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 active:bg-[#FAFAFA]',
  );

  const inner = (
    <>
      <div
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-foreground-muted',
          iconClassName,
        )}
      >
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-[13px] leading-4 text-foreground-muted">{hint}</p>}
      </div>
      {badge != null && badge > 0 ? (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#E85D04] px-1.5 text-[11px] font-semibold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : (
        <ChevronRight size={16} className="shrink-0 text-[#D1D5DB]" strokeWidth={2} />
      )}
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
