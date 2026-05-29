'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { BottomNav } from './bottom-nav';

const STAFF_PREFIXES = ['/login', '/admin', '/manager', '/restaurant', '/courier'];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff = STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isStaff) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/">
            <span className="text-lg font-bold text-brand-600">FoodApp</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm opacity-80 hover:text-brand-600">
              Profile
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="min-h-[calc(100vh-8rem)] pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
