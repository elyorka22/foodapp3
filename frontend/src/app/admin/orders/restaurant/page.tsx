'use client';

import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { adminI18n } from '@/lib/admin-i18n';

export default function RestaurantOrdersPage() {
  return (
    <AdminOrdersView
      title={adminI18n.nav.restaurantOrders}
      vertical="restaurant"
      merchantColumnLabel={adminI18n.orders.restaurant}
    />
  );
}
