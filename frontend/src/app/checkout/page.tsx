'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import {
  customerNeedsPhone,
  getCustomer,
  getCustomerToken,
  isCustomerLoggedIn,
  saveTrackingToken,
} from '@/lib/customer';
import {
  validateDeliveryLocation,
  type DeliveryLocationValue,
} from '@/components/checkout/delivery-location';
import type { CheckoutActionStep } from '@/lib/checkout-action-step';
import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { CheckoutProductCard } from '@/components/checkout/checkout-product-card';
import { CheckoutPromoCard } from '@/components/checkout/checkout-promo-card';
import { CheckoutPhoneCard } from '@/components/checkout/checkout-phone-card';
import { CheckoutSummaryCard } from '@/components/checkout/checkout-summary-card';
import { CheckoutSubmitBar } from '@/components/checkout/checkout-submit-bar';
import { fetchDeliveryQuote } from '@/hooks/use-delivery-pricing';
import { formatSum } from '@/lib/format-sum';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import { uz } from '@/lib/uz';

const emptyLocation = (): DeliveryLocationValue => ({
  address: '',
  lat: null,
  lng: null,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, total, clear, addItem, decrementItem, removeItem } = useCartStore();
  const [phone, setPhone] = useState('');
  const [actionStep, setActionStep] = useState<CheckoutActionStep>('enter_phone');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationValue>(emptyLocation);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [gettingGps, setGettingGps] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = total();
  const deliveryCalculating = gettingGps || deliveryLoading;
  const deliveryQuoted =
    deliveryFee != null && !deliveryCalculating && deliveryError == null && actionStep === 'place_order';

  const grandTotal = useMemo(() => {
    if (deliveryFee == null) return null;
    return Math.max(0, subtotal - promoDiscount) + deliveryFee;
  }, [subtotal, promoDiscount, deliveryFee]);

  const clearDeliveryQuote = () => {
    setDeliveryFee(null);
    setDeliveryError(null);
    setDeliveryLocation(emptyLocation());
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setError('');

    if (!isValidUzPhone(value)) {
      clearDeliveryQuote();
      setActionStep('enter_phone');
      return;
    }

    if (actionStep === 'place_order' || actionStep === 'calculate_delivery') {
      clearDeliveryQuote();
    }
    setActionStep('confirm_phone');
  };

  useEffect(() => {
    if (isCustomerLoggedIn() && customerNeedsPhone()) {
      router.replace('/complete-profile');
      return;
    }
    const c = getCustomer();
    if (c?.phone) {
      handlePhoneChange(c.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const requestDeliveryQuote = () => {
    if (!restaurantId) return;
    if (!navigator.geolocation) {
      setDeliveryError(uz.locationSendFailed);
      setError(uz.locationSendFailed);
      return;
    }
    setGettingGps(true);
    setDeliveryError(null);
    setError('');
    setDeliveryFee(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDeliveryLocation({ address: '', lat, lng });
        setGettingGps(false);
        setDeliveryLoading(true);
        try {
          const quote = await fetchDeliveryQuote({
            restaurantId,
            latitude: lat,
            longitude: lng,
          });
          setDeliveryFee(quote.deliveryFee);
          setDeliveryError(null);
          setActionStep('place_order');
        } catch (err) {
          setDeliveryFee(null);
          const message = err instanceof Error ? err.message : uz.orderFailed;
          setDeliveryError(message);
          setError(message);
        } finally {
          setDeliveryLoading(false);
        }
      },
      () => {
        setGettingGps(false);
        setDeliveryError(uz.locationSendFailed);
        setError(uz.locationSendFailed);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const applyPromo = async () => {
    if (!promoCode.trim() || !restaurantId) return;
    setValidatingPromo(true);
    setPromoMessage('');
    try {
      const res = await api<{
        valid: boolean;
        message?: string;
        discount: number;
      }>('/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: promoCode.trim(),
          restaurantId,
          subtotal,
          customerId: getCustomer()?.id,
        }),
      });
      if (res.valid) {
        setPromoDiscount(res.discount);
        setPromoMessage(uz.promoDiscount(formatSum(res.discount)));
      } else {
        setPromoDiscount(0);
        setPromoMessage(res.message ?? uz.invalidPromo);
      }
    } catch (err) {
      setPromoDiscount(0);
      setPromoMessage(err instanceof Error ? err.message : uz.promoValidateFailed);
    } finally {
      setValidatingPromo(false);
    }
  };

  const submit = async () => {
    if (!restaurantId || !items.length) return;

    const locationError = validateDeliveryLocation(deliveryLocation);
    if (locationError) {
      setError(locationError);
      return;
    }
    if (deliveryFee == null || deliveryCalculating || deliveryError) {
      setError(uz.deliveryPriceRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedIn = getCustomer();
      const token = getCustomerToken();
      if (loggedIn && customerNeedsPhone()) {
        router.replace('/complete-profile');
        return;
      }
      const address =
        deliveryLocation.address.trim() ||
        `GPS: ${deliveryLocation.lat}, ${deliveryLocation.lng}`;
      const res = await api<{ order: { trackingToken: string; orderNumber?: string } }>('/orders/guest', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          restaurantId,
          phone: loggedIn?.phone ?? normalizePhone(phone),
          customerId: loggedIn?.id,
          deliveryAddress: address,
          latitude: deliveryLocation.lat,
          longitude: deliveryLocation.lng,
          promoCode: promoCode.trim() || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      saveTrackingToken(res.order.trackingToken, res.order.orderNumber);
      clear();
      router.push(`/track/${res.order.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.orderFailed);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-[#FAF7F2] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-zinc-900">{uz.cartEmpty}</p>
          <Link href="/" className="mt-4 inline-block text-[15px] font-semibold text-[#FF7A00]">
            {uz.browseRestaurants}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto min-h-screen max-w-lg bg-[#FAF7F2] px-4 pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
        <CheckoutHeader itemCount={itemCount} />

        <div className="mt-6 space-y-4">
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

          <CheckoutPromoCard
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            onApply={applyPromo}
            validating={validatingPromo}
            message={promoMessage}
          />

          <CheckoutPhoneCard phone={phone} onPhoneChange={handlePhoneChange} />

          {deliveryQuoted ? (
            <CheckoutSummaryCard
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              promoDiscount={promoDiscount}
            />
          ) : null}

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </p>
          ) : null}

          {deliveryError && actionStep === 'calculate_delivery' ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {deliveryError}
            </p>
          ) : null}
        </div>
      </main>

      <CheckoutSubmitBar
        step={actionStep}
        total={grandTotal}
        placingOrder={loading}
        calculating={deliveryCalculating}
        onConfirmPhone={() => setActionStep('calculate_delivery')}
        onCalculate={requestDeliveryQuote}
        onSubmit={submit}
      />
    </>
  );
}
