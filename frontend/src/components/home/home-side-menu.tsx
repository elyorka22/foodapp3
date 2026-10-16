'use client';

import Link from 'next/link';
import {
  Heart,
  HelpCircle,
  Package,
  Sparkles,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';

type Props = {
  open: boolean;
  onClose: () => void;
};

const links = [
  { href: '/restaurants', label: uz.restaurants, icon: UtensilsCrossed },
  { href: '/orders', label: uz.ordersTitle, icon: Package },
  { href: '/favorites', label: uz.favoritesTitle, icon: Heart },
  { href: '/promotions', label: uz.promotionsTitle, icon: Sparkles },
  { href: '/profile', label: uz.navProfile, icon: User },
  { href: '/profile/help', label: uz.profileHelp, icon: HelpCircle },
] as const;

export function HomeSideMenu({ open, onClose }: Props) {
  return (
    <>
      <button
        type="button"
        aria-label={uz.closeMenu}
        className={clsx(
          'fixed inset-0 z-[60] bg-black/35 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          'fixed left-0 top-0 z-[70] flex h-full w-[min(86vw,320px)] flex-col bg-white shadow-[8px_0_40px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-zinc-900">{uz.appTitle}</p>
            <p className="mt-0.5 text-sm text-zinc-500">{uz.appSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={uz.closeMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition active:scale-95"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-8" aria-label={uz.openMenu}>
          <ul className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-[15px] font-semibold text-zinc-800 transition hover:bg-zinc-50 active:bg-zinc-100"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
