'use client';

import { Phone } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  phone: string;
  onPhoneChange: (value: string) => void;
};

export function CheckoutPhoneCard({ phone, onPhoneChange }: Props) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <label className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
        <Phone size={16} className="text-[#FF7A00]" />
        {uz.phone.split('(')[0].trim()}
      </label>
      <input
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+998 90 123 45 67"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        className="h-14 w-full rounded-2xl border-0 bg-[#FAF7F2] px-4 text-[17px] font-semibold text-zinc-900 outline-none ring-1 ring-zinc-100 placeholder:font-normal placeholder:text-zinc-400 focus:ring-2 focus:ring-[#FF7A00]/30"
      />
    </div>
  );
}
