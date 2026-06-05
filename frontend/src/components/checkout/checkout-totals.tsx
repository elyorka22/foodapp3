'use client';

import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Props = {
  subtotal: number;
  deliveryFee: number | null;
  promoDiscount?: number;
  deliveryLoading?: boolean;
  deliveryError?: string | null;
};

export function CheckoutTotals({
  subtotal,
  deliveryFee,
  promoDiscount = 0,
  deliveryLoading,
  deliveryError,
}: Props) {
  const netSubtotal = Math.max(0, subtotal - promoDiscount);
  const total =
    deliveryFee != null ? netSubtotal + deliveryFee : null;

  return (
    <div className="mt-3 space-y-1 text-sm">
      <p className="flex justify-between">
        <span>{uz.productsSubtotal}</span>
        <span className="font-medium">{formatSum(subtotal)}</span>
      </p>
      {promoDiscount > 0 && (
        <p className="flex justify-between text-green-600">
          <span>{uz.promoApplied}</span>
          <span>−{formatSum(promoDiscount)}</span>
        </p>
      )}
      <p className="flex justify-between">
        <span>{uz.deliveryLabel}</span>
        <span className="font-medium">
          {deliveryLoading
            ? uz.detectingLocation
            : deliveryError
              ? '—'
              : deliveryFee != null
                ? formatSum(deliveryFee)
                : uz.locationRequiredShort}
        </span>
      </p>
      {deliveryError && (
        <p className="text-xs text-red-500">{deliveryError}</p>
      )}
      {total != null && (
        <p className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold dark:border-white/10">
          <span>{uz.orderTotal}</span>
          <span>{formatSum(total)}</span>
        </p>
      )}
    </div>
  );
}
