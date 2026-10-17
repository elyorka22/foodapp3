'use client';

import { Phone } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';

type Props = {
  className?: string;
};

export function PartnershipContactCta({ className }: Props) {
  const settings = usePublicSettings();
  const data = settings.data;
  const phone = data?.partnership_phone?.trim();

  if (!phone) {
    return (
      <p className={`text-sm text-zinc-500 ${className ?? ''}`}>{uz.contactNotConfigured}</p>
    );
  }

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div>
        <p className="text-[15px] font-medium text-zinc-800">{uz.contactViaPhone}</p>
        <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F4F4F5] px-4 py-4 active:scale-[0.99]"
        >
          <Phone size={22} className="shrink-0 text-[#18181B]" />
          <span className="text-[16px] font-semibold text-[#18181B]">{phone}</span>
        </a>
      </div>
    </div>
  );
}
