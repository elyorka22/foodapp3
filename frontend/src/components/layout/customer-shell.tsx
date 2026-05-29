'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { SiteHeader } from './site-header';

const STAFF_PREFIXES = ['/login', '/admin', '/manager', '/restaurant', '/courier'];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isStaff) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      <BottomNav />
    </div>
  );
}
