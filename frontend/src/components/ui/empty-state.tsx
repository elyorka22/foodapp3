import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { EmptyExpression, type EmptyMood } from '@/components/ui/empty-expression';

type Props = {
  /** Kept so existing call sites compile. The face replaces the icon. */
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  mood?: EmptyMood;
};

export function EmptyState({
  title,
  description,
  action,
  className,
  mood = 'calm',
}: Props) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center rounded-[22px] bg-white px-6 py-11 text-center shadow-[0_8px_32px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.03]',
        className,
      )}
    >
      <EmptyExpression mood={mood} className="mb-5 h-28 w-28 text-zinc-900" />
      <h3 className="text-lg font-bold tracking-tight text-zinc-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
