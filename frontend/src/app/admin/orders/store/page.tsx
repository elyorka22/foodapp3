'use client';

import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { adminI18n } from '@/lib/admin-i18n';

export default function StoreOrdersPage() {
  return (
    <AdminOrdersView
      title={adminI18n.nav.storeOrders}
      vertical="store"
      merchantColumnLabel={adminI18n.orders.store}
    />
  );
}
