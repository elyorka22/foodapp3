'use client';

import { Button } from '@/components/ui/button';

export type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  guestOrder?: { phone: string; deliveryAddress: string };
  restaurant?: { name: string };
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'COURIER_ASSIGNED',
  COURIER_ASSIGNED: 'PICKED_UP',
  PICKED_UP: 'DELIVERING',
  DELIVERING: 'DELIVERED',
};

export function OrderTable({
  orders,
  onStatusChange,
  showRestaurant,
}: {
  orders: OrderRow[];
  onStatusChange: (id: string, status: string) => void;
  showRestaurant?: boolean;
}) {
  if (!orders.length) return <p className="text-sm opacity-60">No orders</p>;

  return (
    <div className="overflow-x-auto rounded-xl border dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-900">
          <tr>
            <th className="p-3">#</th>
            {showRestaurant && <th className="p-3">Restaurant</th>}
            <th className="p-3">Phone</th>
            <th className="p-3">Status</th>
            <th className="p-3">Total</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const next = NEXT_STATUS[o.status];
            return (
              <tr key={o.id} className="border-t dark:border-white/10">
                <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                {showRestaurant && <td className="p-3">{o.restaurant?.name}</td>}
                <td className="p-3">{o.guestOrder?.phone}</td>
                <td className="p-3">
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-xs dark:bg-brand-900">
                    {o.status}
                  </span>
                </td>
                <td className="p-3">{Number(o.total).toLocaleString()}</td>
                <td className="p-3">
                  {next && (
                    <Button size="sm" onClick={() => onStatusChange(o.id, next)}>
                      → {next}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
