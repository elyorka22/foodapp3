'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';
import { Button } from '@/components/ui/button';

type Props = {
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onApply: () => void;
  validating: boolean;
  message: string;
};

export function CheckoutPromoCard({
  promoCode,
  onPromoCodeChange,
  onApply,
  validating,
  message,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="text-[15px] font-semibold text-zinc-900">{uz.checkoutPromoLabel}</span>
        <ChevronDown
          size={20}
          className={clsx('text-zinc-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open ? (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
              placeholder={uz.promoCode}
              className="h-12 min-w-0 flex-1 rounded-2xl border-0 bg-[#FAF7F2] px-4 text-[15px] outline-none ring-1 ring-zinc-100 focus:ring-2 focus:ring-[#FF7A00]/30"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={onApply}
              disabled={validating}
              className="h-12 shrink-0 rounded-2xl px-5"
            >
              {validating ? '...' : uz.apply}
            </Button>
          </div>
          {message ? (
            <p className="mt-2 text-[13px] font-medium text-[#FF7A00]">{message}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
