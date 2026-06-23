'use client';

import { clsx } from 'clsx';
import { uz } from '@/lib/uz';

type Props = {
  secondaryLabel?: string;
  primaryLabel: string;
  onSecondary?: () => void;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryLoadingLabel?: string;
};

export function CheckoutDualActionBar({
  secondaryLabel = uz.clear,
  primaryLabel,
  onSecondary,
  onPrimary,
  primaryDisabled = false,
  secondaryDisabled = false,
  primaryLoading = false,
  primaryLoadingLabel,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-white/40 bg-[#FAF7F2]/95 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg gap-2">
        {onSecondary ? (
          <button
            type="button"
            disabled={secondaryDisabled || primaryLoading}
            onClick={onSecondary}
            className="flex h-14 min-w-[7.5rem] items-center justify-center rounded-[20px] border border-zinc-200 bg-white px-4 text-[15px] font-semibold text-zinc-700 transition active:scale-[0.98] disabled:opacity-50"
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={primaryDisabled || primaryLoading}
          onClick={onPrimary}
          className={clsx(
            'flex h-14 flex-1 items-center justify-center rounded-[20px] px-4 text-[16px] font-bold text-white shadow-[0_12px_32px_rgba(255,122,0,0.45)] transition',
            'bg-gradient-to-r from-[#FF8A1F] via-[#FF7A00] to-[#FF6B00]',
            'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
          )}
        >
          {primaryLoading ? primaryLoadingLabel ?? uz.placingOrder : primaryLabel}
        </button>
      </div>
    </div>
  );
}
