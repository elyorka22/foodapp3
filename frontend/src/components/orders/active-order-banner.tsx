'use client';

import Link from 'next/link';
import { ChevronRight, Truck } from 'lucide-react';
import { useActiveOrder } from '@/hooks/use-active-order';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

export function ActiveOrderBanner() {
  const { token, order, isLoading, isActive } = useActiveOrder();

  if (!token) return null;
  if (!isLoading && !isActive) return null;

  const statusLabel = order
    ? uz.orderStatus[order.status] ?? order.status
    : uz.loading;
  const orderNumber = order?.orderNumber;
  const restaurantName = order?.restaurant?.name ?? order?.business?.name;

  return (
    <Link
      href={`/track/${token}`}
      className="block rounded-[22px] bg-gradient-to-br from-[#FFF7F0] to-[#FFEDD5] p-4 shadow-[0_8px_32px_rgba(255,122,0,0.12)] transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#FF7A00] shadow-sm">
          <Truck size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#C2410C]/80">
            {uz.activeOrderTitle}
          </p>
          <p className="mt-0.5 text-[17px] font-bold text-[#9A3412]">{statusLabel}</p>
          {orderNumber ? (
            <p className="mt-0.5 text-[13px] text-[#C2410C]">{uz.orderNumber(orderNumber)}</p>
          ) : null}
          {restaurantName ? (
            <p className="mt-0.5 truncate text-[13px] text-[#C2410C]/90">{restaurantName}</p>
          ) : null}
          {order?.total != null ? (
            <p className="mt-1 text-[14px] font-semibold text-[#9A3412]">{formatSum(order.total)}</p>
          ) : null}
        </div>
        <ChevronRight size={22} className="mt-2 shrink-0 text-[#C2410C]" aria-hidden />
      </div>
      <p className="mt-3 text-center text-[13px] font-semibold text-[#FF7A00]">
        {uz.activeOrderTrack} →
      </p>
    </Link>
  );
}
