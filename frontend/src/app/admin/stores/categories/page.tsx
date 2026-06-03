'use client';

import { MerchantCategoriesPage } from '@/components/admin/merchant-categories-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function StoreCategoriesPage() {
  return (
    <MerchantCategoriesPage
      title={adminI18n.categories.storeTitle}
      vertical="store"
      listHref="/admin/stores"
    />
  );
}
