'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { CheckoutProductCard } from '@/components/checkout/checkout-product-card';
import { CheckoutDualActionBar } from '@/components/checkout/checkout-dual-action-bar';
import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { ActiveOrderBanner } from '@/components/orders/active-order-banner';
import { checkoutMainClass } from '@/lib/checkout-layout';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';
import { useActiveOrder } from '@/hooks/use-active-order';

export default function CartPage() {
  const { items, total, addItem, decrementItem, removeItem } = useCartStore();
  const { clearAll, goToDetails } = useCheckoutFlow();
  const { isActive: hasActiveOrder } = useActiveOrder();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!items.length) {
    return (
      <main className={checkoutMainClass}>
        <CheckoutHeader title={uz.cartTitle} />
        <div className="mt-6 space-y-4">
          <ActiveOrderBanner />
          {!hasActiveOrder ? (
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-zinc-900">{uz.cartEmpty}</p>
              <Link href="/" className="mt-4 inline-block text-[15px] font-semibold text-[#FF7A00]">
                {uz.browseRestaurants}
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={checkoutMainClass}>
        <CheckoutHeader title={uz.cartTitle} subtitle={uz.checkoutItemCount(itemCount)} />

        <div className="mt-6 space-y-4">
          <ActiveOrderBanner />

          {items.map((item) => (
            <CheckoutProductCard
              key={item.productId}
              item={item}
              onIncrement={() =>
                addItem(
                  {
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    restaurantId: item.restaurantId,
                    imageUrl: item.imageUrl,
                    restaurantName: item.restaurantName,
                  },
                  1,
                )
              }
              onDecrement={() => decrementItem(item.productId)}
              onRemove={() => removeItem(item.productId)}
            />
          ))}

          <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between text-[15px]">
              <span className="font-medium text-zinc-600">{uz.subtotal}</span>
              <span className="text-[20px] font-bold text-zinc-900">{formatSum(total())}</span>
            </div>
          </div>
        </div>
      </main>

      <CheckoutDualActionBar
        onSecondary={clearAll}
        onPrimary={goToDetails}
        primaryLabel={uz.checkout}
      />
    </>
  );
}
