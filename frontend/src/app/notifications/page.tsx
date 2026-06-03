'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { EmptyState } from '@/components/ui/empty-state';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { useNotificationsSocket } from '@/hooks/use-notifications-socket';
import { isCustomerLoggedIn } from '@/lib/customer';
import { uz } from '@/lib/uz';

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function NotificationsPage() {
  const loggedIn = isCustomerLoggedIn();
  const { list, unread, markRead, markAllRead, token } = useCustomerNotifications();
  useNotificationsSocket(!!token);

  const unreadCount = unread.data?.count ?? 0;
  const items = list.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{uz.notificationsTitle}</h1>
        {loggedIn && unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1 text-sm font-medium text-[#E85D04]"
          >
            <CheckCheck size={16} />
            {uz.notificationsMarkAllRead}
          </button>
        )}
      </div>

      {!loggedIn && (
        <EmptyState
          icon={Bell}
          title={uz.notificationsTitle}
          description={uz.notificationsLoginHint}
        />
      )}

      {loggedIn && list.isLoading && (
        <p className="py-8 text-center text-sm text-foreground-muted">{uz.loading}</p>
      )}

      {loggedIn && !list.isLoading && items.length === 0 && (
        <EmptyState
          icon={Bell}
          title={uz.notificationsTitle}
          description={uz.notificationsEmptyHint}
        />
      )}

      {loggedIn && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={clsx(
                  'w-full rounded-2xl bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition active:scale-[0.99]',
                  !n.isRead && 'ring-1 ring-[#E85D04]/30',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={clsx(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      n.isRead ? 'bg-transparent' : 'bg-[#E85D04]',
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-foreground">{n.title}</p>
                    <p className="mt-1 text-[14px] leading-snug text-foreground-muted">{n.body}</p>
                    <p className="mt-2 text-[12px] text-[#9CA3AF]">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {loggedIn && (
        <p className="mt-4 text-center text-[12px] text-foreground-muted">
          {uz.notificationsRefreshHint}
        </p>
      )}
    </main>
  );
}
