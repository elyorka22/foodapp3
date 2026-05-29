'use client';

import { clsx } from 'clsx';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 text-sm opacity-70 dark:border-white/10 dark:bg-zinc-900">
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm opacity-70">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  subLabel,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subLabel && <p className="mt-1 text-xs opacity-60">{subLabel}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'DELIVERED'
      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      : status === 'CANCELLED'
        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
        : status === 'PENDING'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
          : 'bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-200';

  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-medium', tone)}>
      {status}
    </span>
  );
}

