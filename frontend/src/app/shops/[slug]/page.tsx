'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StoreMenuScreen } from '@/components/store/store-menu-screen';

function ShopMenuInner() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const fromType = searchParams.get('from')?.trim();
  const backHref =
    fromType && /^[a-z0-9-]+$/i.test(fromType)
      ? `/stores/${encodeURIComponent(fromType)}`
      : '/stores';

  return <StoreMenuScreen slug={slug} backHref={backHref} />;
}

export default function ShopMenuPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen max-w-lg bg-background" />}>
      <ShopMenuInner />
    </Suspense>
  );
}
