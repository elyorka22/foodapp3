'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  itemCount: number;
};

export function CheckoutHeader({ itemCount }: Props) {
  return (
    <header className="pt-[calc(env(safe-area-inset-top,0px)+8px)]">
      <div className="flex items-start gap-3">
        <Link
          href="/cart"
          aria-label={uz.back}
          className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition active:scale-95"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-zinc-900">
            {uz.checkoutHeading}
          </h1>
          <p className="mt-1 text-[15px] font-medium text-zinc-500">
            {uz.checkoutItemCount(itemCount)}
          </p>
        </div>
      </div>
    </header>
  );
}
