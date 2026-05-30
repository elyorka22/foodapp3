'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

export function PromoBanner({ banners, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton className="mt-5 h-28 w-full rounded-2xl" />;
  }

  const banner = banners.find((b) => resolveImageUrl(b.imageUrl));
  if (!banner) return null;

  const src = resolveImageUrl(banner.imageUrl)!;
  const title = banner.title?.trim();
  const description = banner.description?.trim();
  const href = banner.linkUrl?.trim();
  const hasText = Boolean(title || description);

  const imageBlock = (
    <div
      className={
        hasText
          ? 'relative aspect-[3.2/1] w-full overflow-hidden rounded-2xl bg-zinc-100'
          : 'relative aspect-[3.2/1] w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-card'
      }
    >
      <Image src={src} alt={title || 'Aksiya'} fill className="object-cover" sizes="100vw" unoptimized />
    </div>
  );

  const content = (
    <div className={hasText ? 'overflow-hidden rounded-2xl bg-white shadow-card' : ''}>
      {imageBlock}
      {hasText && (
        <div className="px-4 py-3">
          {title && <p className="text-[15px] font-bold text-zinc-900">{title}</p>}
          {description && (
            <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="mt-5 block active:scale-[0.99]">
        {content}
      </Link>
    );
  }

  return <div className="mt-5">{content}</div>;
}
