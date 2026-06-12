import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Clock3, Store } from 'lucide-react';
import { uz } from '@/lib/uz';

export type BusinessAvailability = {
  isOpen?: boolean;
  closesAt?: string | null;
  closingSoon?: boolean;
};

type Props = BusinessAvailability & {
  className?: string;
  onDark?: boolean;
};

export function BusinessAvailabilityBadge({
  isOpen,
  closesAt,
  closingSoon,
  className,
  onDark = false,
}: Props) {
  if (isOpen == null) return null;

  const showClosing = isOpen && closingSoon && closesAt;

  const dotColor = showClosing
    ? onDark
      ? 'bg-amber-300'
      : 'bg-amber-500'
    : isOpen
      ? onDark
        ? 'bg-emerald-400'
        : 'bg-emerald-500'
      : onDark
        ? 'bg-zinc-300'
        : 'bg-zinc-400';

  const labelColor = onDark ? 'text-white' : 'text-zinc-900';
  const suffixColor = showClosing
    ? onDark
      ? 'text-amber-100'
      : 'text-amber-700'
    : onDark
      ? 'text-white/80'
      : 'text-zinc-500';

  return (
    <span className={clsx('inline-flex min-w-0 items-center gap-1.5 text-[13px]', className)}>
      <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} />
      <span className={clsx('font-semibold', labelColor)}>
        {isOpen ? uz.open : uz.closed}
      </span>
      {showClosing ? (
        <>
          <span className={onDark ? 'text-white/70' : 'text-zinc-400'}>·</span>
          <span className={clsx('truncate', suffixColor)}>{uz.closesAt(closesAt)}</span>
        </>
      ) : null}
    </span>
  );
}

type StatusCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  className: string;
  iconWrapClassName: string;
  titleClassName: string;
  subtitleClassName: string;
};

function StatusCard({
  icon,
  title,
  subtitle,
  className,
  iconWrapClassName,
  titleClassName,
  subtitleClassName,
}: StatusCardProps) {
  return (
    <div
      className={clsx(
        'mb-3 flex items-start gap-3 rounded-2xl border px-3.5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          iconWrapClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className={clsx('text-[15px] font-bold leading-tight', titleClassName)}>{title}</p>
        <p className={clsx('mt-0.5 text-[13px] leading-snug', subtitleClassName)}>{subtitle}</p>
      </div>
    </div>
  );
}

export function BusinessAvailabilityBanner({
  isOpen,
  closesAt,
  closingSoon,
}: BusinessAvailability) {
  if (isOpen == null) return null;

  const showClosing = isOpen && closingSoon && closesAt;

  if (showClosing) {
    return (
      <StatusCard
        className="border-amber-200 bg-amber-50"
        iconWrapClassName="bg-amber-100 text-amber-600"
        titleClassName="text-amber-950"
        subtitleClassName="text-amber-700"
        title={uz.closingSoonTitle}
        subtitle={uz.closesAt(closesAt)}
        icon={<Clock3 size={22} strokeWidth={2.25} />}
      />
    );
  }

  if (isOpen) {
    return (
      <StatusCard
        className="border-emerald-200 bg-emerald-50"
        iconWrapClassName="bg-emerald-100 text-emerald-600"
        titleClassName="text-emerald-950"
        subtitleClassName="text-emerald-700"
        title={uz.open}
        subtitle={uz.openNowHint}
        icon={<CheckCircle2 size={22} strokeWidth={2.25} />}
      />
    );
  }

  return (
    <StatusCard
      className="border-zinc-200 bg-white"
      iconWrapClassName="bg-zinc-100 text-zinc-500"
      titleClassName="text-zinc-900"
      subtitleClassName="text-zinc-500"
      title={uz.closed}
      subtitle={uz.closedHint}
      icon={<Store size={22} strokeWidth={2.25} />}
    />
  );
}
