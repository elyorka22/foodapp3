import { clsx } from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-2xl font-semibold transition',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-primary text-white shadow-button-primary hover:bg-primary-hover',
        variant === 'secondary' &&
          'border border-border bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-background dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        variant === 'danger' && 'bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:bg-red-700',
        variant === 'ghost' && 'text-primary hover:bg-primary-soft dark:hover:bg-brand-950/40',
        size === 'sm' && 'min-h-9 px-3.5 text-sm',
        size === 'md' && 'min-h-11 px-4 py-2.5 text-sm',
        size === 'lg' && 'min-h-[3.25rem] w-full px-4 text-base',
        className,
      )}
      {...props}
    />
  );
}
