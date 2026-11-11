'use client';

import { useParams } from 'next/navigation';
import { AdminProductsPage } from '@/components/admin/admin-products-page';
import { SharedCatalogProductsPage } from '@/components/admin/shared-catalog-products-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

export default function StoreTypeProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);
  const title = `${type?.name ?? slug} — mahsulotlar`;

  if (type?.menuMode === 'SHARED_CATALOG') {
    return <SharedCatalogProductsPage typeSlug={slug} pageTitle={title} />;
  }

  return (
    <AdminProductsPage
      vertical="store"
      typeSlug={slug}
      pageTitle={title}
    />
  );
}
