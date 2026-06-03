'use client';

import { MerchantCategoriesPage } from '@/components/admin/merchant-categories-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function RestaurantCategoriesPage() {
  return (
    <MerchantCategoriesPage
      title={adminI18n.categories.restaurantTitle}
      vertical="restaurant"
      listHref="/admin/restaurants"
    />
  );
}
