'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { CheckoutDeliveryCard } from '@/components/checkout/checkout-delivery-card';
import { CheckoutSummaryCard } from '@/components/checkout/checkout-summary-card';
import { CheckoutDualActionBar } from '@/components/checkout/checkout-dual-action-bar';
import { checkoutMainClass } from '@/lib/checkout-layout';
import { formatSum } from '@/lib/format-sum';
import { isValidUzPhone } from '@/lib/phone';
import { uz } from '@/lib/uz';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';

export default function CheckoutDeliveryPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    grandTotal,
    checkout,
    deliveryQuoted,
    deliveryCalculating,
    deliveryError,
    loading,
    error,
    requestDeliveryQuote,
    submitOrder,
    ensureLoggedInCustomer,
  } = useCheckoutFlow();

  useEffect(() => {
    if (!ensureLoggedInCustomer()) return;
    if (!items.length) return;
    if (!isValidUzPhone(checkout.phone)) {
      router.replace('/checkout');
    }
  }, [checkout.phone, ensureLoggedInCustomer, items.length, router]);

  if (!items.length) {
    return (
      <main className={checkoutMainClass}>
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-zinc-900">{uz.cartEmpty}</p>
          <Link href="/" className="mt-4 inline-block text-[15px] font-semibold text-[#FF7A00]">
            {uz.browseRestaurants}
          </Link>
        </div>
      </main>
    );
  }

  const primaryLabel =
    deliveryQuoted && grandTotal != null
      ? uz.checkoutPlaceOrderWithTotal(formatSum(grandTotal))
      : uz.calculateDeliveryPrice;

  return (
    <>
      <main className={checkoutMainClass}>
        <CheckoutHeader
          title={uz.checkoutStepDelivery}
          subtitle={uz.deliveryPriceHint}
          backHref="/checkout"
        />

        <div className="mt-6 space-y-4">
          <CheckoutDeliveryCard
            value={checkout.deliveryLocation}
            calculating={deliveryCalculating}
            quoted={deliveryQuoted}
            deliveryFee={checkout.deliveryFee}
            billableDistanceKm={checkout.billableDistanceKm}
            deliveryError={deliveryError}
            onRecalculate={requestDeliveryQuote}
          />

          {deliveryQuoted ? (
            <CheckoutSummaryCard
              subtotal={subtotal}
              deliveryFee={checkout.deliveryFee}
              promoDiscount={checkout.promoDiscount}
            />
          ) : null}

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      </main>

      <CheckoutDualActionBar
        secondaryLabel={uz.recalculateDeliveryPrice}
        onSecondary={deliveryQuoted ? requestDeliveryQuote : undefined}
        onPrimary={deliveryQuoted ? submitOrder : requestDeliveryQuote}
        primaryLabel={primaryLabel}
        primaryDisabled={deliveryCalculating}
        primaryLoading={loading || deliveryCalculating}
        primaryLoadingLabel={deliveryCalculating ? uz.deliveryCalculating : uz.placingOrder}
        secondaryDisabled={deliveryCalculating || loading}
      />
    </>
  );
}
