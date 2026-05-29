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
        'inline-flex items-center justify-center rounded-xl font-semibold transition',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700',
        variant === 'secondary' &&
          'border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        variant === 'danger' && 'bg-red-600 text-white shadow-md hover:bg-red-700',
        variant === 'ghost' && 'text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40',
        size === 'sm' && 'min-h-9 px-3.5 text-sm',
        size === 'md' && 'min-h-11 px-4 py-2.5 text-sm',
        size === 'lg' && 'min-h-[3.25rem] w-full px-4 text-base',
        className,
      )}
      {...props}
    />
  );
}
