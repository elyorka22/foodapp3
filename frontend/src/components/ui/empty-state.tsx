import { clsx } from 'clsx';
import {
  Bell,
  Heart,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react';

export type EmptyMood =
  | 'sad'
  | 'pouty'
  | 'confused'
  | 'calm'
  | 'curious'
  | 'pensive'
  | 'pleased'
  | 'quiet';

const MOOD_ICON: Record<EmptyMood, LucideIcon> = {
  sad: ShoppingBag,
  pouty: ShoppingBag,
  confused: Package,
  calm: Store,
  curious: Package,
  pensive: Heart,
  pleased: Sparkles,
  quiet: Bell,
};

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  mood?: EmptyMood;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  mood = 'calm',
}: Props) {
  const Icon = icon ?? MOOD_ICON[mood];

  return (
    <div
      className={clsx(
        'rounded-[28px] bg-white px-6 py-8 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#F3EEFF]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={30} strokeWidth={1.75} className="text-[#4A05CA]" />
        </span>
      </div>
      <h3 className="text-[17px] font-bold leading-snug tracking-tight text-zinc-900">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-[18rem] text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
