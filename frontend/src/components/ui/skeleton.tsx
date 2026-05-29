import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80',
        className,
      )}
    />
  );
}
