import { clsx } from 'clsx';
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

export function BusinessAvailabilityBanner({
  isOpen,
  closesAt,
  closingSoon,
}: BusinessAvailability) {
  if (isOpen == null) return null;

  const showClosing = isOpen && closingSoon && closesAt;

  if (isOpen && !showClosing) {
    return (
      <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2">
        <BusinessAvailabilityBadge isOpen />
      </p>
    );
  }

  const message = showClosing
    ? `${uz.open} · ${uz.closesAt(closesAt)}`
    : uz.restaurantClosed;

  return (
    <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{message}</p>
  );
}
