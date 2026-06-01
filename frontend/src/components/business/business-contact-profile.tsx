'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-url';

type Props = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
};

/** Marketplace shop — main image + logo + phone (no cart). */
export function BusinessContactProfile({
  name,
  description,
  logoUrl,
  coverUrl,
  phone,
}: Props) {
  const logo = resolveImageUrl(logoUrl);
  const cover = resolveImageUrl(coverUrl);
  const tel = phone?.replace(/\s/g, '');

  return (
    <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="relative aspect-[16/10] bg-zinc-100">
        {cover ? (
          <Image src={cover} alt={name} fill className="object-cover" unoptimized priority />
        ) : logo ? (
          <Image src={logo} alt={name} fill className="object-cover" unoptimized priority />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-300">🏪</div>
        )}
        {logo && cover && (
          <div className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
            <Image src={logo} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>
      <div className="p-5 text-center">
        <h2 className="text-lg font-bold text-zinc-900">{name}</h2>
        {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
        {tel ? (
          <a
            href={`tel:${tel}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white active:scale-[0.98]"
          >
            <Phone size={20} />
            {phone}
          </a>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Telefon raqami ko&apos;rsatilmagan</p>
        )}
      </div>
    </div>
  );
}
