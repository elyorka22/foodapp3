'use client';

import { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderLineItems } from '@/components/orders/order-line-items';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { uz } from '@/lib/uz';
import type { OrderRow } from '@/components/orders/order-table';

const t = businessPanelI18n.ordersPage;

type Props = {
  order: OrderRow;
  onStatusChange: (id: string, status: string) => void;
  onRequestCourier?: (id: string) => void;
  requestCourierPending?: boolean;
};

export function RestaurantOrderCard({
  order,
  onStatusChange,
  onRequestCourier,
  requestCourierPending,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const canRequestCourier =
    order.status === 'PREPARING' && !order.courierRequestedAt && !!onRequestCourier;
  const courierRequested = order.status === 'PREPARING' && !!order.courierRequestedAt;
  const canAccept = order.status === 'PENDING' || order.status === 'ACCEPTED';
  const acceptTarget =
    order.status === 'PENDING' ? 'ACCEPTED' : order.status === 'ACCEPTED' ? 'PREPARING' : null;
  const statusLabel = uz.orderStatus[order.status] ?? order.status;
  const phone = order.guestOrder?.phone;

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-brand-600">#{order.orderNumber}</p>
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {phone}
            </a>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-base font-bold">{Number(order.total).toLocaleString()} so&apos;m</p>
          <span className="mt-1 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {statusLabel}
          </span>
        </div>
      </div>

      {courierRequested ? (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {t.courierCalled}
        </p>
      ) : null}

      {expanded && Array.isArray(order.items) && order.items.length > 0 ? (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
          <OrderLineItems items={order.items} />
          {order.guestOrder?.deliveryAddress ? (
            <p className="mt-2 border-t pt-2 text-xs text-zinc-500 dark:border-white/10">
              {order.guestOrder.deliveryAddress}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {canAccept && acceptTarget ? (
          <Button
            size="sm"
            className="min-h-10 flex-1 px-3"
            onClick={() => onStatusChange(order.id, acceptTarget)}
          >
            {t.accept}
          </Button>
        ) : null}
        {canRequestCourier ? (
          <Button
            size="sm"
            className="min-h-10 flex-1 bg-orange-500 px-3 hover:bg-orange-600"
            disabled={requestCourierPending}
            onClick={() => onRequestCourier?.(order.id)}
          >
            {t.requestCourier}
          </Button>
        ) : null}
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium dark:border-white/15"
          >
            {t.callCustomer}
          </a>
        ) : null}
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-medium text-zinc-500"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t.collapse : t.expand}
          <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </article>
  );
}
