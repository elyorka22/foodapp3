'use client';

import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { businessPanelI18n } from '@/lib/business-panel-i18n';

export type BusinessDashboardData = {
  commissionRate: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  commissionToday: number;
  commissionWeek: number;
  commissionMonth: number;
  netRevenueToday: number;
  netRevenueWeek: number;
  netRevenueMonth: number;
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  revenueChart: Array<{ date: string; value: number }>;
  commissionChart: Array<{ date: string; value: number }>;
  ordersChart: Array<{ date: string; value: number }>;
};

type Props = {
  data: BusinessDashboardData;
  ordersHref: string;
};

export function BusinessDashboardView({ data, ordersHref }: Props) {
  const t = businessPanelI18n;
  const c = t.commission;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label={t.stats.revenueToday} value={`${data.revenueToday.toLocaleString()} UZS`} />
        <Stat label={t.stats.revenueWeek} value={`${data.revenueWeek.toLocaleString()} UZS`} />
        <Stat label={t.stats.revenueMonth} value={`${data.revenueMonth.toLocaleString()} UZS`} />
        <Stat label={t.stats.ordersToday} value={data.ordersToday} />
        <Stat label={t.stats.ordersWeek} value={data.ordersWeek} />
        <Stat label={t.stats.avgOrder} value={`${Math.round(data.averageOrderValue).toLocaleString()} UZS`} />
      </div>

      <section className="rounded-xl border p-4 dark:border-white/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{c.title}</h2>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            {c.rate}: {data.commissionRate}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label={c.today} value={`${data.commissionToday.toLocaleString()} UZS`} />
          <Stat label={c.week} value={`${data.commissionWeek.toLocaleString()} UZS`} />
          <Stat label={c.month} value={`${data.commissionMonth.toLocaleString()} UZS`} />
          <Stat label={c.netToday} value={`${data.netRevenueToday.toLocaleString()} UZS`} />
          <Stat label={c.netWeek} value={`${data.netRevenueWeek.toLocaleString()} UZS`} />
          <Stat label={c.netMonth} value={`${data.netRevenueMonth.toLocaleString()} UZS`} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t.charts.revenueTrend}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#ea580c" fill="#fed7aa" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t.charts.commissionTrend}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.commissionChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="#ddd6fe" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title={t.charts.ordersTrend}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.ordersChart}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#bae6fd" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border p-4 dark:border-white/10">
        <h2 className="mb-3 font-semibold">{t.topProducts}</h2>
        {!data.topProducts.length ? (
          <p className="text-sm opacity-60">{t.noSalesYet}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.topProducts.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>
                  {p.name} <span className="opacity-60">×{p.quantity}</span>
                </span>
                <span>{p.revenue.toLocaleString()} UZS</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href={ordersHref} className="text-sm font-semibold text-brand-600">
        {t.manageOrders}
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-3 dark:border-white/10">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 dark:border-white/10">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}
