'use client';

import Link from 'next/link';
import { ChevronLeft, MessageCircle, Phone } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';
import { Button } from '@/components/ui/button';

type Props = {
  variant: 'help' | 'partnership';
};

export function ProfileContactPage({ variant }: Props) {
  const settings = usePublicSettings();
  const data = settings.data;

  const title = variant === 'help' ? uz.profileHelp : uz.profilePartnership;
  const telegramUrl =
    variant === 'help' ? data?.help_telegram_url : data?.partnership_telegram_url;
  const telegramLabel =
    variant === 'help' ? data?.help_telegram_label : data?.partnership_telegram_label;
  const phone = variant === 'partnership' ? data?.partnership_phone : '';

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-full p-2 active:bg-zinc-200"
          aria-label={uz.back}
        >
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold text-zinc-900">{title}</h1>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-[15px] font-medium text-zinc-800">{uz.contactViaTelegram}</p>

        {telegramUrl ? (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl bg-[#E8F7FD] px-4 py-4 active:scale-[0.99]"
          >
            <MessageCircle size={22} className="shrink-0 text-[#229ED9]" />
            <span className="text-[16px] font-semibold text-[#229ED9]">
              {telegramLabel || uz.openTelegram}
            </span>
          </a>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">{uz.contactNotConfigured}</p>
        )}

        {variant === 'partnership' && phone ? (
          <>
            <p className="mt-6 text-[15px] font-medium text-zinc-800">{uz.contactViaPhone}</p>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FFF4EB] px-4 py-4 active:scale-[0.99]"
            >
              <Phone size={22} className="shrink-0 text-[#FF6B00]" />
              <span className="text-[16px] font-semibold text-[#FF6B00]">{phone}</span>
            </a>
          </>
        ) : null}
      </div>

      <div className="mt-6">
        <Link href="/profile">
          <Button type="button" variant="secondary" className="w-full">
            {uz.back}
          </Button>
        </Link>
      </div>
    </main>
  );
}
