'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-url';

type Props = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
};

/** Marketplace shop shown as logo + phone only (no cart). */
export function BusinessContactProfile({ name, description, logoUrl, phone }: Props) {
  const logo = resolveImageUrl(logoUrl);
  const tel = phone?.replace(/\s/g, '');

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white p-6 text-center shadow-card">
      <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl bg-zinc-100">
        {logo ? (
          <Image src={logo} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-300">🏪</div>
        )}
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-900">{name}</h2>
      {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
      {tel ? (
        <a
          href={`tel:${tel}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white active:scale-[0.98]"
        >
          <Phone size={20} />
          {phone}
        </a>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Telefon raqami ko&apos;rsatilmagan</p>
      )}
    </div>
  );
}
