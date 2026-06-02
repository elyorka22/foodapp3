import { clsx } from 'clsx';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full min-h-[52px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 dark:border-white/20 dark:bg-zinc-900',
        props.className,
      )}
    />
  );
}
