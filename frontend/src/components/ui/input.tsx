import { clsx } from 'clsx';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 dark:border-white/20 dark:bg-zinc-900',
        props.className,
      )}
    />
  );
}
