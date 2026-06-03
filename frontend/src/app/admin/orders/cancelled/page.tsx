'use client';

import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { adminI18n } from '@/lib/admin-i18n';

export default function CancelledOrdersPage() {
  return (
    <AdminOrdersView
      title={adminI18n.nav.cancelledOrders}
      statusGroup="cancelled"
      lockStatus
    />
  );
}
