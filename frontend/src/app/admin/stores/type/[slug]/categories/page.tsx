'use client';

import { useParams } from 'next/navigation';
import { MerchantCategoriesPage } from '@/components/admin/merchant-categories-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

export default function StoreTypeCategoriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);
  const name = type?.name ?? slug;

  return (
    <MerchantCategoriesPage
      title={`${name} — mahsulot kategoriyalari`}
      vertical="store"
      listHref={`/admin/stores/type/${encodeURIComponent(slug)}`}
      typeSlug={slug}
    />
  );
}
