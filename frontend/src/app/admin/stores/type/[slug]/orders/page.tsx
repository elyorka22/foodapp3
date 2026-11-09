'use client';

import { useParams } from 'next/navigation';
import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';
import { adminI18n } from '@/lib/admin-i18n';

export default function StoreTypeOrdersPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);
  const name = type?.name ?? slug;

  return (
    <AdminOrdersView
      title={`${name} — buyurtmalar`}
      vertical="store"
      businessType={slug}
      merchantColumnLabel={adminI18n.orders.store}
    />
  );
}
