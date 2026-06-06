'use client';

import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Props = {
  subtotal: number;
  deliveryFee: number | null;
  promoDiscount?: number;
};

export function CheckoutSummaryCard({
  subtotal,
  deliveryFee,
  promoDiscount = 0,
}: Props) {
  const netSubtotal = Math.max(0, subtotal - promoDiscount);
  const total = deliveryFee != null ? netSubtotal + deliveryFee : null;

  if (total == null) return null;

  return (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <div className="space-y-3 text-[15px] text-zinc-600">
        <div className="flex items-center justify-between">
          <span>{uz.productsSubtotal}</span>
          <span className="font-semibold text-zinc-900">{formatSum(subtotal)}</span>
        </div>
        {promoDiscount > 0 ? (
          <div className="flex items-center justify-between text-green-600">
            <span>{uz.promoApplied}</span>
            <span className="font-semibold">−{formatSum(promoDiscount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span>{uz.deliveryLabel}</span>
          <span className="font-semibold text-zinc-900">{formatSum(deliveryFee)}</span>
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-dashed border-zinc-200 pt-5">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-zinc-500">
          {uz.checkoutGrandTotal}
        </span>
        <span className="text-[28px] font-black leading-none tracking-tight text-zinc-900">
          {formatSum(total)}
        </span>
      </div>
    </div>
  );
}
