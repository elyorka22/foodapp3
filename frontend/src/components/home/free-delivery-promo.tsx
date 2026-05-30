'use client';

import { Truck } from 'lucide-react';

export function FreeDeliveryPromo() {
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#E8F9EF] px-4 py-4 shadow-card">
      <div className="relative z-10 flex max-w-[65%] flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600">
            <Truck size={18} strokeWidth={2.25} />
          </span>
          <p className="text-[15px] font-bold leading-tight text-zinc-900">
            Yetkazib berish bepul! 🎉
          </p>
        </div>
        <p className="text-xs leading-snug text-zinc-600">
          30 000 so&apos;mdan yuqori buyurtmalarga
        </p>
      </div>
      <div
        className="pointer-events-none absolute -right-1 bottom-0 top-0 flex w-[42%] items-end justify-center"
        aria-hidden
      >
        <span className="text-[4.5rem] leading-none drop-shadow-lg">🛵</span>
      </div>
    </div>
  );
}
