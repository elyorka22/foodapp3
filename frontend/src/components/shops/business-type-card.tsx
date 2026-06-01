'use client';

import Image from 'next/image';
import Link from 'next/link';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import type { BusinessType } from '@/hooks/use-shops-data';

/** Clean marketplace category tile — image only, no overlays or on-image text. */
export function BusinessTypeCard({ type }: { type: BusinessType }) {
  const imageUrl = resolveImageUrl(type.imageUrl);
  const href = `/shops/category/${encodeURIComponent(type.slug)}`;

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-2xl shadow-md transition active:scale-[0.98]"
      aria-label={type.name}
    >
      <div className="relative aspect-[4/3] w-full bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={type.name}
            fill
            sizes="(max-width: 512px) 50vw, 240px"
            loading="lazy"
            className="object-cover"
            style={categoryImageStyle(type)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-200" aria-hidden />
        )}
      </div>
    </Link>
  );
}
