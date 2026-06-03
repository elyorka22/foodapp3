'use client';

import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { adminI18n } from '@/lib/admin-i18n';

export default function ActiveOrdersPage() {
  return (
    <AdminOrdersView
      title={adminI18n.nav.activeOrders}
      statusGroup="active"
      lockStatus
    />
  );
}
