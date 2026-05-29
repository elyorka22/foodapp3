'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/use-admin-notifications';

export function NotificationsBell() {
  const { list, unread, markRead, markAllRead } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const count = unread.data?.count ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-lg border p-2 dark:border-white/10"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b px-3 py-2 dark:border-white/10">
              <p className="text-sm font-semibold">Notifications</p>
              {count > 0 && (
                <button
                  type="button"
                  className="text-xs text-brand-600"
                  onClick={() => markAllRead.mutate()}
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {!list.data?.length ? (
                <li className="px-3 py-4 text-sm opacity-60">No notifications</li>
              ) : (
                list.data.map((n: any) => (
                  <li
                    key={n.id}
                    className={`border-b px-3 py-3 text-sm dark:border-white/10 ${n.isRead ? 'opacity-60' : ''}`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => !n.isRead && markRead.mutate(n.id)}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs opacity-70">{n.body}</p>
                      <p className="mt-1 text-[10px] opacity-50">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
