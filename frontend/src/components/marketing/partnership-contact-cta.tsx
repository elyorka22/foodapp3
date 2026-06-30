'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';

type Props = {
  className?: string;
};

export function PartnershipContactCta({ className }: Props) {
  const settings = usePublicSettings();
  const data = settings.data;
  const telegramUrl = data?.partnership_telegram_url?.trim();
  const telegramLabel = data?.partnership_telegram_label?.trim();
  const phone = data?.partnership_phone?.trim();

  if (!telegramUrl && !phone) {
    return (
      <p className={`text-sm text-zinc-500 ${className ?? ''}`}>{uz.contactNotConfigured}</p>
    );
  }

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {telegramUrl ? (
        <div>
          <p className="text-[15px] font-medium text-zinc-800">{uz.contactViaTelegram}</p>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-2xl bg-[#E8F7FD] px-4 py-4 active:scale-[0.99]"
          >
            <MessageCircle size={22} className="shrink-0 text-[#229ED9]" />
            <span className="text-[16px] font-semibold text-[#229ED9]">
              {telegramLabel || uz.openTelegram}
            </span>
          </a>
        </div>
      ) : null}
      {phone ? (
        <div>
          <p className="text-[15px] font-medium text-zinc-800">{uz.contactViaPhone}</p>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="mt-3 flex items-center gap-3 rounded-2xl bg-[#FFF4EB] px-4 py-4 active:scale-[0.99]"
          >
            <Phone size={22} className="shrink-0 text-[#FF6B00]" />
            <span className="text-[16px] font-semibold text-[#FF6B00]">{phone}</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
