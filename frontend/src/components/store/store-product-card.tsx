'use client';

import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { useCartStore } from '@/store/cart';
import { MenuProductImage } from '@/components/restaurant/menu-product-image';
import type { MenuProduct } from '@/components/restaurant/product-card';

type Props = {
  product: MenuProduct;
  restaurantId: string;
  restaurantName?: string;
  disabled?: boolean;
  className?: string;
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

export function StoreProductCard({
  product,
  restaurantId,
  restaurantName,
  disabled,
  className,
}: Props) {
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const imageUrl = productImage(product);
  const price = Number(product.price);
  const compare = product.comparePrice != null ? Number(product.comparePrice) : null;
  const hasDiscount = compare != null && compare > price;
  const discountPct =
    hasDiscount && compare! > 0
      ? Math.round(((compare! - price) / compare!) * 100)
      : null;
  const weight = parseWeight(product.description);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      restaurantId,
      imageUrl: imageUrl ?? null,
      restaurantName: restaurantName ?? null,
    });
  };

  const removeFromCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    decrementItem(product.id);
  };

  return (
    <article className={clsx('flex w-[8.75rem] shrink-0 flex-col', className)}>
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-zinc-100">
        {imageUrl ? (
          <MenuProductImage src={imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl opacity-30">
            🛒
          </div>
        )}
        {discountPct != null && discountPct > 0 ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
            −{discountPct}%
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <p className="text-[15px] font-extrabold leading-tight text-zinc-900">
          {formatSum(price)}
        </p>
        {hasDiscount ? (
          <p className="mt-0.5 text-[12px] text-zinc-400 line-through">
            {formatSum(compare!)}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-zinc-800">
          {product.name}
        </h3>
        {weight ? (
          <p className="mt-0.5 text-[11px] text-zinc-400">{weight}</p>
        ) : null}

        <div className="mt-auto pt-2">
          {quantity === 0 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={addToCart}
              className={clsx(
                'flex h-9 w-full items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition active:scale-[0.98]',
                disabled && 'opacity-40',
              )}
              aria-label={uz.addToCart}
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <div
              className={clsx(
                'flex h-9 w-full items-center justify-between rounded-full bg-zinc-100 text-zinc-900',
                disabled && 'opacity-40',
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={removeFromCart}
                className="flex h-9 w-10 items-center justify-center active:opacity-70"
                aria-label={uz.remove}
              >
                <Minus size={18} strokeWidth={2.5} />
              </button>
              <span className="text-sm font-bold tabular-nums">{quantity}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={addToCart}
                className="flex h-9 w-10 items-center justify-center active:opacity-70"
                aria-label={uz.addToCart}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
