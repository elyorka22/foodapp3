'use client';

import { clsx } from 'clsx';
import { formatSum } from '@/lib/format-sum';
import type { CheckoutActionStep } from '@/lib/checkout-action-step';
import { uz } from '@/lib/uz';

type Props = {
  step: CheckoutActionStep;
  total: number | null;
  placingOrder: boolean;
  calculating: boolean;
  onConfirmPhone: () => void;
  onCalculate: () => void;
  onSubmit: () => void;
};

function buttonLabel(
  step: CheckoutActionStep,
  placingOrder: boolean,
  calculating: boolean,
  total: number | null,
): string {
  if (placingOrder) return uz.placingOrder;
  if (calculating) return uz.deliveryCalculating;

  switch (step) {
    case 'enter_phone':
      return uz.checkoutEnterPhone;
    case 'confirm_phone':
      return uz.checkoutPhoneEntered;
    case 'calculate_delivery':
      return uz.calculateDeliveryPrice;
    case 'place_order':
      return total != null
        ? uz.checkoutPlaceOrderWithTotal(formatSum(total))
        : uz.checkoutPlaceOrder;
  }
}

function isButtonEnabled(
  step: CheckoutActionStep,
  placingOrder: boolean,
  calculating: boolean,
): boolean {
  if (placingOrder || calculating) return false;
  return step !== 'enter_phone';
}

export function CheckoutSubmitBar({
  step,
  total,
  placingOrder,
  calculating,
  onConfirmPhone,
  onCalculate,
  onSubmit,
}: Props) {
  const busy = placingOrder || calculating;
  const label = buttonLabel(step, placingOrder, calculating, total);
  const disabled = !isButtonEnabled(step, placingOrder, calculating);

  const handleClick = () => {
    if (busy || disabled) return;
    switch (step) {
      case 'confirm_phone':
        onConfirmPhone();
        break;
      case 'calculate_delivery':
        onCalculate();
        break;
      case 'place_order':
        onSubmit();
        break;
    }
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
