'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { SiteHeader } from './site-header';

const STAFF_PREFIXES = ['/login', '/admin', '/manager', '/restaurant', '/courier'];
const HIDE_HEADER_PATHS = ['/', '/favorites'];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hideHeader = HIDE_HEADER_PATHS.includes(pathname);

  if (isStaff) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {!hideHeader && <SiteHeader />}
      <div className="pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      <BottomNav />
    </div>
  );
}
