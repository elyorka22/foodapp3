'use client';

import { useParams } from 'next/navigation';
import { AdminProductsPage } from '@/components/admin/admin-products-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

export default function StoreTypeProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);

  return (
    <AdminProductsPage
      vertical="store"
      typeSlug={slug}
      pageTitle={`${type?.name ?? slug} — mahsulotlar`}
    />
  );
}
