'use client';

import Link from 'next/link';
import {
  BarChart3,
  CalendarHeart,
  ChevronLeft,
  Megaphone,
  Smartphone,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import { PartnershipContactCta } from '@/components/marketing/partnership-contact-cta';
import { uz } from '@/lib/uz';

type Props = {
  backHref?: string;
  backLabel?: string;
};

const benefitIcons = [Users, BarChart3, Smartphone, Truck, CalendarHeart, Megaphone, Store] as const;

export function HamkorlikContent({ backHref = '/', backLabel }: Props) {
  const benefits = uz.hamkorlikBenefits;

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="mb-5 flex items-center gap-2">
        <Link
          href={backHref}
          className="rounded-full p-2 active:bg-zinc-200"
          aria-label={backLabel ?? uz.back}
        >
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold text-zinc-900">{uz.profilePartnership}</h1>
      </div>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#FF8F3D] p-6 text-white shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
          {uz.hamkorlikEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight">{uz.hamkorlikHeroTitle}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/95">{uz.hamkorlikHeroBody}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-base font-bold text-zinc-900">{uz.hamkorlikBenefitsTitle}</h3>
        <ul className="mt-3 flex flex-col gap-3">
          {benefits.map((text, index) => {
            const Icon = benefitIcons[index % benefitIcons.length];
            return (
              <li
                key={text}
                className="flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EB] text-[#FF6B00]">
                  <Icon size={20} />
                </span>
                <p className="pt-1.5 text-[15px] leading-snug text-zinc-800">{text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-base font-bold text-zinc-900">{uz.hamkorlikCtaTitle}</h3>
        <p className="mt-2 text-sm text-zinc-600">{uz.hamkorlikCtaBody}</p>
        <PartnershipContactCta className="mt-5" />
      </section>
    </main>
  );
}
