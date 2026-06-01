'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { SiteHeader } from './site-header';

const STAFF_PREFIXES = ['/login', '/admin', '/manager', '/business', '/restaurant', '/courier'];
const HIDE_HEADER_PATHS = ['/', '/shops', '/products', '/favorites', '/notifications', '/cart', '/profile', '/checkout'];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hideHeader =
    HIDE_HEADER_PATHS.includes(pathname) || pathname.startsWith('/restaurants/');

  if (isStaff) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {!hideHeader && <SiteHeader />}
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      <BottomNav />
    </div>
  );
}
