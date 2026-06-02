import { clsx } from 'clsx';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
