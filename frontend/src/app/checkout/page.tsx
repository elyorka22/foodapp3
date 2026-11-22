'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckoutPromoCard } from '@/components/checkout/checkout-promo-card';
import { CheckoutPhoneCard } from '@/components/checkout/checkout-phone-card';
import { CheckoutDualActionBar } from '@/components/checkout/checkout-dual-action-bar';
import { checkoutMainClass } from '@/lib/checkout-layout';
import { isValidUzPhone } from '@/lib/phone';
import { uz } from '@/lib/uz';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';

export default function CheckoutDetailsPage() {
  const {
    items,
    checkout,
    validatingPromo,
    error,
    clearAll,
    applyPromo,
    handlePhoneChange,
    goToDelivery,
    ensureLoggedInCustomer,
  } = useCheckoutFlow();

  useEffect(() => {
    ensureLoggedInCustomer();
  }, [ensureLoggedInCustomer]);

  if (!items.length) {
    return (
      <main className={checkoutMainClass}>
        <div className="mt-8">
          <EmptyState
            mood="pouty"
            title={uz.cartEmpty}
            action={
              <Link href="/" className="text-[15px] font-semibold text-zinc-900">
                {uz.browseRestaurants}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={checkoutMainClass}>
        <CheckoutHeader
          title={uz.checkoutStepDetails}
          subtitle={uz.checkoutTitle}
          backHref="/cart"
        />

        <div className="mt-6 space-y-4">
          <CheckoutPromoCard
            promoCode={checkout.promoCode}
            onPromoCodeChange={checkout.setPromoCode}
            onApply={applyPromo}
            validating={validatingPromo}
            message={checkout.promoMessage}
            defaultOpen
          />

          <CheckoutPhoneCard phone={checkout.phone} onPhoneChange={handlePhoneChange} />

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      </main>

      <CheckoutDualActionBar
        onSecondary={clearAll}
        onPrimary={goToDelivery}
        primaryLabel={uz.checkout}
        primaryDisabled={!isValidUzPhone(checkout.phone)}
      />
    </>
  );
}
