'use client';

import Image from 'next/image';
import { Heart, Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { useCartStore } from '@/store/cart';

export type MenuProduct = {
  id: string;
  name: string;
  price: string | number;
  comparePrice?: string | number | null;
  description?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
};

type Props = {
  product: MenuProduct;
  restaurantId: string;
  disabled?: boolean;
};

function productImage(product: MenuProduct): string | null {
  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  return resolveImageUrl(primary?.url);
}

function parseWeight(description?: string | null): string | null {
  if (!description) return null;
  const match = description.match(/(\d+(?:[.,]\d+)?)\s*(?:g|г|kg|кг|ml|мл|l|л)\b/i);
  return match ? match[0].replace(',', '.') : null;
}

function discountPercent(price: number, compare: number): number | null {
  if (compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

export function ProductCard({ product, restaurantId, disabled }: Props) {
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const imageUrl = productImage(product);
  const price = Number(product.price);
  const compare = product.comparePrice != null ? Number(product.comparePrice) : null;
  const hasDiscount = compare != null && compare > price;
  const discount = hasDiscount ? discountPercent(price, compare!) : null;
  const weight = parseWeight(product.description);
  const titleWeight = weight
    ? product.description?.replace(/\d+(?:[.,]\d+)?\s*(?:g|г|kg|кг|ml|мл|l|л)\b/i, '').trim()
    : product.description;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      restaurantId,
    });
  };

  const removeFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    decrementItem(product.id);
  };

  return (
    <article className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            sizes="120px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white text-3xl opacity-25">🍽</div>
        )}

        <button
          type="button"
          className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-700"
          aria-label={uz.favoritesAria}
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={14} strokeWidth={2} />
        </button>

        {discount != null && discount > 0 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            −{discount}%
          </span>
        )}

        {quantity === 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={addToCart}
            className={clsx(
              'absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-900 transition active:scale-95',
              disabled && 'opacity-40',
            )}
            aria-label={uz.addToCart}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            className={clsx(
              'absolute bottom-1.5 right-1.5 flex items-center rounded-full bg-white text-zinc-900 shadow-sm',
              disabled && 'opacity-40',
            )}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={removeFromCart}
              className="flex h-9 w-8 items-center justify-center rounded-l-full active:bg-zinc-100"
              aria-label={uz.remove}
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="min-w-[1.25rem] text-center text-sm font-bold tabular-nums">{quantity}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={addToCart}
              className="flex h-9 w-8 items-center justify-center rounded-r-full active:bg-zinc-100"
              aria-label={uz.addToCart}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-1.5 px-0.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="text-[15px] font-bold leading-tight text-brand-600">{formatSum(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-zinc-400 line-through">{formatSum(compare!)}</span>
          )}
        </div>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-zinc-900">
          {product.name}
          {weight && <span className="text-zinc-500"> {weight}</span>}
        </h3>
        {titleWeight && !weight && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">{titleWeight}</p>
        )}
      </div>
    </article>
  );
}
