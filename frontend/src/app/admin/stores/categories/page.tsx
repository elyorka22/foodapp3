'use client';

import { MerchantCategoriesPage } from '@/components/admin/merchant-categories-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function AdminStoreCategoriesPage() {
  return (
    <MerchantCategoriesPage
      title="Do'kon mahsulot kategoriyalari"
      vertical="store"
      listHref="/admin/stores"
    />
  );
}
