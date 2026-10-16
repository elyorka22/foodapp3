import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center rounded-[22px] bg-white px-6 py-11 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.03] dark:bg-zinc-900/50 dark:ring-white/10',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft dark:bg-zinc-800">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
