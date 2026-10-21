'use client';

import { Heart, Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { useCartStore } from '@/store/cart';
import { MenuProductImage } from '@/components/restaurant/menu-product-image';

export type MenuProduct = {
  id: string;
  name: string;
  price: string | number;
  comparePrice?: string | number | null;
  description?: string | null;
  dishCategoryId?: string | null;
  productCategoryId?: string | null;
  dishCategory?: { id: string; name: string } | null;
  productCategory?: { id: string; name: string } | null;
  images?: { url: string; isPrimary?: boolean }[];
};

type Props = {
  product: MenuProduct;
  restaurantId: string;
  restaurantName?: string;
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

function discountAmount(price: number, compare: number): number | null {
  if (compare <= price) return null;
  return compare - price;
}

export function ProductCard({ product, restaurantId, restaurantName, disabled }: Props) {
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const imageUrl = productImage(product);
  const price = Number(product.price);
  const compare = product.comparePrice != null ? Number(product.comparePrice) : null;
  const hasDiscount = compare != null && compare > price;
  const discount = hasDiscount ? discountAmount(price, compare!) : null;
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
    <article className="flex flex-col">
      {/* Image — plus lives here (bottom-right), not under the card. */}
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-zinc-100">
        {imageUrl ? (
          <MenuProductImage src={imageUrl} alt={product.name} />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 text-3xl opacity-30">
            🍽
          </div>
        )}

        {discount != null && discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
            −{formatSum(discount)}
          </span>
        )}

        <button
          type="button"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500/90 active:scale-95"
          aria-label={uz.favoritesAria}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={20} strokeWidth={2} />
        </button>

        {quantity === 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={addToCart}
            className={clsx(
              'absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition active:scale-95',
              disabled && 'opacity-40',
            )}
            aria-label={uz.addToCart}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            className={clsx(
              'absolute bottom-2 right-2 flex items-center rounded-full bg-white text-zinc-900 shadow-[0_4px_14px_rgba(15,23,42,0.18)]',
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
            <span className="min-w-[1.1rem] text-center text-sm font-bold tabular-nums">
              {quantity}
            </span>
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

      <div className="mt-2 px-0.5">
        <p className="text-[16px] font-extrabold leading-tight text-zinc-900">
          {formatSum(price)}
        </p>
        {hasDiscount && (
          <p className="mt-0.5 text-sm text-zinc-400 line-through">
            {formatSum(compare!)}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug text-zinc-900">
          {product.name}
        </h3>
        {weight ? (
          <p className="mt-0.5 text-xs text-zinc-400">{weight}</p>
        ) : product.description?.trim() ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-zinc-500">
            {product.description.trim()}
          </p>
        ) : null}
      </div>
    </article>
  );
}
