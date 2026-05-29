'use client';

import { clsx } from 'clsx';

export function ActiveBadge({ active, label }: { active: boolean; label?: string }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-1 text-xs font-medium',
        active
          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
          : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300',
      )}
    >
      {label ?? (active ? 'Active' : 'Inactive')}
    </span>
  );
}
