'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';

type Props = {
  unreadCount: number;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: number;
};

/**
 * Shaking notification bell — matches Flutter `NotificationBell`:
 * short ring every 4s when unread > 0, red count badge, respects reduced motion.
 */
export function NotificationBell({
  unreadCount,
  href = '/notifications',
  onClick,
  className,
  size = 22,
}: Props) {
  const hasUnread = unreadCount > 0;
  const label =
    hasUnread
      ? `${uz.notificationsAria}, ${unreadCount} ta yangi`
      : uz.notificationsAria;

  const inner = (
    <>
      <Bell
        size={size}
        strokeWidth={hasUnread ? 2.25 : 2}
        className={clsx(hasUnread && 'notification-bell-ring origin-top')}
        fill={hasUnread ? 'currentColor' : 'none'}
        aria-hidden
      />
      <span
        className={clsx(
          'absolute right-0.5 top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-[10px] border-2 border-[#F5F5F7] bg-[#FF3B5C] px-1 text-[10px] font-bold leading-none text-white transition-transform duration-200',
          hasUnread ? 'scale-100' : 'scale-0',
        )}
        aria-hidden={!hasUnread}
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </>
  );

  const classes = clsx(
    'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-900 transition active:scale-95 active:bg-zinc-100',
    className,
  );

  if (onClick && !href) {
    return (
      <button type="button" aria-label={label} onClick={onClick} className={classes}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={label} onClick={onClick} className={classes}>
      {inner}
    </Link>
  );
}
