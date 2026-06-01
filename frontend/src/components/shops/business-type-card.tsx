'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image-url';
import type { BusinessType } from '@/hooks/use-shops-data';

export function BusinessTypeCard({
  type,
  active,
  onSelect,
}: {
  type: BusinessType;
  active?: boolean;
  onSelect?: () => void;
}) {
  const imageUrl = resolveImageUrl(type.imageUrl);
  const href = `/shops?type=${type.slug}`;

  const inner = (
    <div
      className={`relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-3 shadow-md transition active:scale-[0.98] ${
        active ? 'ring-2 ring-brand-600 ring-offset-2' : ''
      }`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={type.name} fill className="object-cover" unoptimized />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10">
        {type.icon && <span className="text-2xl">{type.icon}</span>}
        <p className="mt-1 text-sm font-bold text-white drop-shadow">{type.name}</p>
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
