'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { StoreCatalogOffersPage } from '@/components/admin/store-catalog-offers-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';
import { LoadingState } from '@/components/admin/ui';

function StoreTypeOffersInner() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);

  return (
    <StoreCatalogOffersPage
      typeSlug={slug}
      typeName={type?.name}
      initialBusinessId={search.get('businessId') ?? undefined}
    />
  );
}

export default function StoreTypeOffersPage() {
  return (
    <Suspense fallback={<LoadingState label="Yuklanmoqda..." />}>
      <StoreTypeOffersInner />
    </Suspense>
  );
}
