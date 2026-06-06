'use client';

import { Flame, ShieldCheck, Zap } from 'lucide-react';
import { uz } from '@/lib/uz';

const badges = [
  { icon: ShieldCheck, label: uz.checkoutTrustQuality },
  { icon: Zap, label: uz.checkoutTrustFast },
  { icon: Flame, label: uz.checkoutTrustHot },
] as const;

export function CheckoutTrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-[18px] bg-white/80 px-2 py-3 text-center shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
        >
          <Icon size={20} className="text-[#FF7A00]" strokeWidth={2} />
          <p className="mt-2 text-[11px] font-semibold leading-snug text-zinc-600">{label}</p>
        </div>
      ))}
    </div>
  );
}
