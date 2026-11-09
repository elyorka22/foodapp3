'use client';

import { useParams } from 'next/navigation';
import { AdminStoresPage } from '@/components/admin/admin-stores-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

export default function StoreTypeListPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);

  return <AdminStoresPage typeSlug={slug} typeName={type?.name} />;
}
