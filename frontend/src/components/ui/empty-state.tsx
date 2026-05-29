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
        'flex flex-col items-center rounded-2xl border border-zinc-100 bg-zinc-50/80 px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card dark:bg-zinc-800">
          <Icon className="h-7 w-7 text-brand-600" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
