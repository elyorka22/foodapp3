'use client';

import { AdminOrdersView } from '@/components/admin/admin-orders-view';
import { adminI18n } from '@/lib/admin-i18n';

export default function AllOrdersPage() {
  return <AdminOrdersView title={adminI18n.nav.allOrders} />;
}
