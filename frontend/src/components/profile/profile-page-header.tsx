'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { NotificationBell } from '@/components/ui/notification-bell';
import { uz } from '@/lib/uz';

type Props = {
  name: string;
  phone?: string | null;
  unreadCount?: number;
};

export function ProfilePageHeader({ name, phone, unreadCount = 0 }: Props) {
  return (
    <header className="pt-1">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-900">
          {uz.profile}
        </h1>
        <div className="flex items-center gap-1">
          <Link
            href="/profile/help"
            aria-label={uz.profileHelp}
            className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-900 transition active:bg-zinc-100"
          >
            <MessageCircle size={22} strokeWidth={2} />
          </Link>
          <NotificationBell unreadCount={unreadCount} size={22} />
        </div>
      </div>

      <div className="mt-4">
        <p className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-zinc-900">
          {name}
        </p>
        {phone ? (
          <p className="mt-1 text-[15px] font-medium text-zinc-500">{phone}</p>
        ) : null}
      </div>
    </header>
  );
}
