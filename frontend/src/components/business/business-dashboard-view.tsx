'use client';

import { useState } from 'react';
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

type Period = 'today' | 'week' | 'month';

type Props = {
  data: BusinessDashboardData;
  ordersHref: string;
};

export function BusinessDashboardView({ data, ordersHref }: Props) {
  const t = businessPanelI18n;
  const c = t.commission;
  const [period, setPeriod] = useState<Period>('today');

  const periodMetrics = {
    today: {
      orders: data.ordersToday,
      revenue: data.revenueToday,
      commission: data.commissionToday,
      net: data.netRevenueToday,
      avg: data.averageOrderValue,
    },
    week: {
      orders: data.ordersWeek,
      revenue: data.revenueWeek,
      commission: data.commissionWeek,
      net: data.netRevenueWeek,
      avg: data.ordersWeek > 0 ? data.revenueWeek / data.ordersWeek : 0,
    },
    month: {
      orders: data.ordersMonth,
      revenue: data.revenueMonth,
      commission: data.commissionMonth,
      net: data.netRevenueMonth,
      avg: data.ordersMonth > 0 ? data.revenueMonth / data.ordersMonth : 0,
    },
  }[period];

  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: t.period.today },
    { id: 'week', label: t.period.week },
    { id: 'month', label: t.period.month },
  ];

  const chartData = formatChartSeries(data.revenueChart);

  return (
    <div className="space-y-4 pb-2">
      <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              period === p.id
                ? 'bg-white text-brand-600 shadow-sm dark:bg-zinc-900'
                : 'text-zinc-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t.stats.orders} value={periodMetrics.orders} accent />
        <Stat label={t.stats.revenue} value={formatSum(periodMetrics.revenue)} />
        <Stat label={c.netShort} value={formatSum(periodMetrics.net)} />
        <Stat label={t.stats.avgOrder} value={formatSum(Math.round(periodMetrics.avg))} />
      </div>

      <details className="group rounded-2xl border bg-white dark:border-white/10 dark:bg-zinc-900">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 font-semibold [&::-webkit-details-marker]:hidden">
          <span>{c.title}</span>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            {data.commissionRate}%
          </span>
        </summary>
        <div className="border-t px-4 pb-4 pt-3 dark:border-white/10">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label={c.today} value={formatSum(data.commissionToday)} />
            <MiniStat label={c.week} value={formatSum(data.commissionWeek)} />
            <MiniStat label={c.month} value={formatSum(data.commissionMonth)} />
            <MiniStat
              label={period === 'today' ? c.netToday : period === 'week' ? c.netWeek : c.netMonth}
              value={formatSum(periodMetrics.net)}
            />
          </div>
        </div>
      </details>

      <ChartCard title={t.charts.revenueTrend}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              width={42}
              tickFormatter={(v) => compactAxis(v)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString()} so'm`,
                t.stats.revenue,
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ea580c"
              fill="#fed7aa"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t.charts.ordersTrend}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={formatChartSeries(data.ordersChart)}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis width={28} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#bae6fd" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">{t.topProducts}</h2>
        {!data.topProducts.length ? (
          <p className="text-sm text-zinc-500">{t.noSalesYet}</p>
        ) : (
          <ul className="space-y-2">
            {data.topProducts.map((p, i) => (
              <li
                key={p.name}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-500">×{p.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatSum(p.revenue)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href={ordersHref}
        className="flex min-h-12 items-center justify-center rounded-2xl bg-brand-600 text-sm font-semibold text-white shadow-sm"
      >
        {t.manageOrders.replace(' →', '')}
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        accent
          ? 'bg-brand-600 text-white'
          : 'border bg-white dark:border-white/10 dark:bg-zinc-900'
      }`}
    >
      <p className={`text-[10px] font-medium uppercase tracking-wide ${accent ? 'text-brand-100' : 'text-zinc-500'}`}>
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold leading-tight ${accent ? '' : 'text-zinc-900 dark:text-zinc-50'}`}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function formatSum(n: number) {
  return `${n.toLocaleString()} so'm`;
}

function compactAxis(n: number) {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1000) return `${n / 1000}k`;
  return String(n);
}

function formatChartSeries(rows: Array<{ date: string; value: number }>) {
  return rows.map((row) => {
    const d = new Date(row.date);
    const label = Number.isNaN(d.getTime())
      ? row.date.slice(5)
      : d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
    return { ...row, label };
  });
}
