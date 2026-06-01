'use client';

import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

export default function NotificationsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div>
        <EmptyState
          icon={Bell}
          title={uz.notificationsTitle}
          description={uz.notificationsEmptyHint}
        />
      </div>
    </main>
  );
}
