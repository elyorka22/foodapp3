'use client';

import { clsx } from 'clsx';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Props = {
  total: number | null;
  loading: boolean;
  disabled: boolean;
  onSubmit: () => void;
};

export function CheckoutSubmitBar({ total, loading, disabled, onSubmit }: Props) {
  const label =
    loading
      ? uz.placingOrder
      : total != null
        ? uz.checkoutPlaceOrderWithTotal(formatSum(total))
        : uz.placeOrder;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-[#FAF7F2]/95 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-md">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={onSubmit}
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
