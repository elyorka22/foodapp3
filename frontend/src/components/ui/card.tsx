import { clsx } from 'clsx';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-[20px] border border-zinc-100/90 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
