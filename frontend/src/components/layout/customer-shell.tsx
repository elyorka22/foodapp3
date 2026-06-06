'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';

const STAFF_PREFIXES = ['/login', '/staff', '/admin', '/manager', '/business', '/restaurant', '/courier'];

/** Minimal pages embedded in the mobile app WebView — no web bottom nav. */
const EMBED_PATHS = ['/auth/telegram-mobile'];

/** Global SiteHeader removed — only the home page shows HomeTopBar inside its own layout. */
export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isEmbed = EMBED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (isStaff) return;
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, [isStaff, pathname]);

  if (isStaff || isEmbed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">{children}</div>
      <BottomNav />
    </div>
  );
}
