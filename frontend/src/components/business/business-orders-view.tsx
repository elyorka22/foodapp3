'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { RestaurantOrderCard } from '@/components/orders/restaurant-order-card';
import type { OrderRow } from '@/components/orders/order-table';
import type { BusinessDashboardData } from '@/components/business/business-dashboard-view';

type OrderFilter = 'all' | 'active' | 'new' | 'done' | 'cancelled';

type Props = {
  orders: OrderRow[];
  stats?: BusinessDashboardData | null;
  dashboardHref: string;
  onStatusChange: (id: string, status: string) => void;
  onRequestCourier: (id: string) => void;
  requestCourierPendingId?: string | null;
};

const ACTIVE_STATUSES = new Set([
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'COURIER_ASSIGNED',
  'ARRIVED_AT_RESTAURANT',
  'PICKED_UP',
  'DELIVERING',
]);

export function BusinessOrdersView({
  orders,
  stats,
  dashboardHref,
  onStatusChange,
  onRequestCourier,
  requestCourierPendingId,
}: Props) {
  const t = businessPanelI18n;
  const p = t.ordersPage;
  const [filter, setFilter] = useState<OrderFilter>('active');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return orders.filter((o) => ACTIVE_STATUSES.has(o.status));
      case 'new':
        return orders.filter((o) => o.status === 'PENDING');
      case 'done':
        return orders.filter((o) => o.status === 'DELIVERED');
      case 'cancelled':
        return orders.filter((o) => o.status === 'CANCELLED');
      default:
        return orders;
    }
  }, [orders, filter]);

  const filters: { id: OrderFilter; label: string }[] = [
    { id: 'active', label: p.filterActive },
    { id: 'new', label: p.filterNew },
    { id: 'all', label: p.filterAll },
    { id: 'done', label: p.filterDone },
    { id: 'cancelled', label: p.filterCancelled },
  ];

  return (
    <div className="space-y-4">
      {stats ? (
        <section className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">{t.period.today}</h2>
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              {p.viewStats}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatTile label={p.summaryOrders} value={String(stats.ordersToday)} />
            <StatTile
              label={p.summaryRevenue}
              value={`${compactSum(stats.revenueToday)}`}
              sub="so'm"
            />
            <StatTile
              label={p.summaryAvg}
              value={`${compactSum(Math.round(stats.averageOrderValue))}`}
              sub="so'm"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs dark:border-white/10">
            <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <p className="text-zinc-500">{t.period.week}</p>
              <p className="mt-0.5 font-semibold">
                {stats.ordersWeek} · {compactSum(stats.revenueWeek)} so&apos;m
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <p className="text-zinc-500">{t.period.month}</p>
              <p className="mt-0.5 font-semibold">
                {stats.ordersMonth} · {compactSum(stats.revenueMonth)} so&apos;m
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500 dark:border-white/10">
          {t.ordersTable.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id}>
              <RestaurantOrderCard
                order={order}
                onStatusChange={onStatusChange}
                onRequestCourier={onRequestCourier}
                requestCourierPending={requestCourierPendingId === order.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 px-2 py-3 text-center dark:bg-zinc-800/50">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-bold leading-tight">{value}</p>
      {sub ? <p className="text-[10px] text-zinc-400">{sub}</p> : null}
    </div>
  );
}

function compactSum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return n.toLocaleString();
}
