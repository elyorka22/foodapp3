'use client';

import Link from 'next/link';
import { ChevronLeft, Phone } from 'lucide-react';
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
  const phone =
    variant === 'partnership' ? data?.partnership_phone?.trim() ?? '' : '';

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-background px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
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
        {variant === 'partnership' && phone ? (
          <>
            <p className="text-[15px] font-medium text-zinc-800">{uz.contactViaPhone}</p>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F4F4F5] px-4 py-4 active:scale-[0.99]"
            >
              <Phone size={22} className="shrink-0 text-[#E11D48]" />
              <span className="text-[16px] font-semibold text-[#E11D48]">{phone}</span>
            </a>
          </>
        ) : (
          <p className="text-sm text-zinc-500">{uz.contactNotConfigured}</p>
        )}
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
