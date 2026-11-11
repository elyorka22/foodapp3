'use client';

import { clsx } from 'clsx';
import type { FulfillmentMethod } from '@/store/checkout';
import { uz } from '@/lib/uz';

type Props = {
  value: FulfillmentMethod;
  onChange: (value: FulfillmentMethod) => void;
};

export function CheckoutFulfillmentCard({ value, onChange }: Props) {
  return (
    <section className="rounded-[22px] border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="text-[16px] font-extrabold tracking-tight text-zinc-900">
        {uz.fulfillmentTitle}
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('delivery')}
          className={clsx(
            'rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98]',
            value === 'delivery'
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-200 bg-zinc-50 text-zinc-800',
          )}
        >
          <p className="text-[14px] font-extrabold">{uz.deliveryLabel}</p>
          <p
            className={clsx(
              'mt-1 text-[12px] font-medium leading-snug',
              value === 'delivery' ? 'text-white/80' : 'text-zinc-500',
            )}
          >
            {uz.fulfillmentDeliveryHint}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onChange('pickup')}
          className={clsx(
            'relative rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98]',
            value === 'pickup'
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-200 bg-zinc-50 text-zinc-800',
          )}
        >
          <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
            {uz.freeBadge}
          </span>
          <p className="text-[14px] font-extrabold">{uz.pickupLabel}</p>
          <p
            className={clsx(
              'mt-1 text-[12px] font-medium leading-snug',
              value === 'pickup' ? 'text-white/80' : 'text-zinc-500',
            )}
          >
            {uz.fulfillmentPickupHint}
          </p>
        </button>
      </div>
    </section>
  );
}
