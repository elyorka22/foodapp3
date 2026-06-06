'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import type { CartItem } from '@/store/cart';

type Props = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export function CheckoutProductCard({ item, onIncrement, onDecrement, onRemove }: Props) {
  return (
    <article className="flex gap-3 rounded-[22px] bg-white p-3 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-[#F3EDE4]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="88px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl opacity-40">🍽</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-snug text-zinc-900">{item.name}</h2>
            {item.restaurantName ? (
              <p className="mt-0.5 truncate text-[13px] text-zinc-500">{item.restaurantName}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={uz.remove}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500 active:scale-95"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="inline-flex items-center rounded-full bg-[#FAF7F2] p-1">
            <button
              type="button"
              onClick={onDecrement}
              aria-label={uz.remove}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm transition active:scale-95"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="min-w-[2rem] text-center text-[15px] font-bold tabular-nums text-zinc-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label={uz.addToCart}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm transition active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-[17px] font-bold text-[#FF7A00]">
            {formatSum(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </article>
  );
}
