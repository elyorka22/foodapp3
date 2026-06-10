'use client';

import { Button } from '@/components/ui/button';
import { OrderLineItems, type OrderLineItem } from '@/components/orders/order-line-items';

export type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items?: OrderLineItem[];
  courierRequestedAt?: string | null;
  guestOrder?: { phone: string; deliveryAddress: string };
  restaurant?: { name: string };
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  COURIER_ASSIGNED: 'ARRIVED_AT_RESTAURANT',
  ARRIVED_AT_RESTAURANT: 'PICKED_UP',
  PICKED_UP: 'DELIVERING',
  DELIVERING: 'DELIVERED',
};

export function OrderTable({
  orders,
  onStatusChange,
  onRequestCourier,
  showRestaurant,
  requestCourierPendingId,
}: {
  orders: OrderRow[];
  onStatusChange: (id: string, status: string) => void;
  onRequestCourier?: (id: string) => void;
  showRestaurant?: boolean;
  requestCourierPendingId?: string | null;
}) {
  const rows = Array.isArray(orders) ? orders : [];
  if (!rows.length) return <p className="text-sm opacity-60">No orders</p>;

  return (
    <div className="overflow-x-auto rounded-xl border dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-900">
          <tr>
            <th className="p-3">#</th>
            {showRestaurant && <th className="p-3">Restaurant</th>}
            <th className="p-3">Phone</th>
            <th className="p-3">Items</th>
            <th className="p-3">Status</th>
            <th className="p-3">Total</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const next = NEXT_STATUS[o.status];
            const canRequestCourier =
              o.status === 'PREPARING' && !o.courierRequestedAt && !!onRequestCourier;
            const courierRequested =
              o.status === 'PREPARING' && !!o.courierRequestedAt;

            return (
              <tr key={o.id} className="border-t dark:border-white/10">
                <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                {showRestaurant && <td className="p-3">{o.restaurant?.name}</td>}
                <td className="p-3">{o.guestOrder?.phone}</td>
                <td className="max-w-xs p-3">
                  {Array.isArray(o.items) && o.items.length > 0 ? (
                    <OrderLineItems items={o.items} />
                  ) : (
                    <span className="text-xs opacity-50">—</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs dark:bg-brand-900">
                      {o.status}
                    </span>
                    {courierRequested && (
                      <span className="text-xs font-medium text-amber-600">
                        Kuryer chaqirildi
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">{Number(o.total).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-2">
                    {canRequestCourier && (
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={requestCourierPendingId === o.id}
                        onClick={() => onRequestCourier?.(o.id)}
                      >
                        Kuryerni chaqirish
                      </Button>
                    )}
                    {next && (
                      <Button size="sm" variant="secondary" onClick={() => onStatusChange(o.id, next)}>
                        → {next}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
