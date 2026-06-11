'use client';

import { Phone } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
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
        {uz.phone}
      </label>
      <PhoneInput
        required
        variant="checkout"
        value={phone}
        onChange={onPhoneChange}
      />
    </div>
  );
}
