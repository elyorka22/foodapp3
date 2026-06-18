'use client';

import { clsx } from 'clsx';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Props = {
  quoted: boolean;
  total: number | null;
  placingOrder: boolean;
  calculating: boolean;
  canSubmit: boolean;
  onCalculate: () => void;
  onSubmit: () => void;
};

export function CheckoutSubmitBar({
  quoted,
  total,
  placingOrder,
  calculating,
  canSubmit,
  onCalculate,
  onSubmit,
}: Props) {
  const busy = placingOrder || calculating;

  const label = placingOrder
    ? uz.placingOrder
    : calculating
      ? uz.deliveryCalculating
      : quoted
        ? total != null
          ? uz.checkoutPlaceOrderWithTotal(formatSum(total))
          : uz.placeOrder
        : uz.calculateDeliveryPrice;

  const disabled = busy || (quoted ? !canSubmit : false);

  const handleClick = () => {
    if (busy) return;
    if (quoted) {
      if (canSubmit) onSubmit();
      return;
    }
    onCalculate();
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-white/40 bg-[#FAF7F2]/95 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          disabled={disabled}
          onClick={handleClick}
          className={clsx(
            'flex h-[66px] w-full items-center justify-center rounded-[22px] text-[17px] font-bold text-white shadow-[0_12px_32px_rgba(255,122,0,0.45)] transition',
            'bg-gradient-to-r from-[#FF8A1F] via-[#FF7A00] to-[#FF6B00]',
            'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
          )}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
