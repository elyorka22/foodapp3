'use client';

import { useParams } from 'next/navigation';
import { AdminBannersPage } from '@/components/admin/admin-banners-page';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

export default function StoreTypeBannersPage() {
  const { slug } = useParams<{ slug: string }>();
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === slug);
  const name = type?.name ?? slug;

  return (
    <AdminBannersPage
      title={`${name} — bannerlar`}
      vertical="store"
      typeSlug={slug}
    />
  );
}
