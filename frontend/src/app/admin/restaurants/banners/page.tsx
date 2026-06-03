'use client';

import { AdminBannersPage } from '@/components/admin/admin-banners-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function RestaurantBannersPage() {
  return (
    <AdminBannersPage title={adminI18n.banners.restaurantTitle} vertical="restaurant" />
  );
}
