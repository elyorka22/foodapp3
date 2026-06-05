'use client';

import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DeliveryLocation,
  validateDeliveryLocation,
  type DeliveryLocationValue,
} from '@/components/checkout/delivery-location';
import { CheckoutTotals } from '@/components/checkout/checkout-totals';
import { DeliveryQuoteBanner } from '@/components/checkout/delivery-quote-banner';
import { fetchDeliveryQuote } from '@/hooks/use-delivery-pricing';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

const mainClass =
  'mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, total, clear } = useCartStore();
  const [phone, setPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationValue>({
    address: '',
    lat: null,
    lng: null,
  });
  const [comment, setComment] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [billableDistanceKm, setBillableDistanceKm] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  useEffect(() => {
    if (isCustomerLoggedIn() && customerNeedsPhone()) {
      router.replace('/complete-profile');
      return;
    }
    const c = getCustomer();
    if (c?.phone) setPhone(c.phone);
    if (c?.defaultDeliveryAddress) {
      setDeliveryLocation((prev) =>
        prev.address ? prev : { ...prev, address: c.defaultDeliveryAddress! },
      );
    }
  }, [router]);

  useEffect(() => {
    if (!restaurantId || deliveryLocation.lat == null || deliveryLocation.lng == null) {
      return;
    }
    const timer = setTimeout(async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);
      try {
        const quote = await fetchDeliveryQuote({
          restaurantId,
          latitude: deliveryLocation.lat!,
          longitude: deliveryLocation.lng!,
        });
        setDeliveryFee(quote.deliveryFee);
        setBillableDistanceKm(quote.billableDistanceKm);
      } catch (err) {
        setDeliveryFee(null);
        setBillableDistanceKm(null);
        setDeliveryError(err instanceof Error ? err.message : uz.orderFailed);
      } finally {
        setDeliveryLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [restaurantId, deliveryLocation.lat, deliveryLocation.lng]);

  const calculateDelivery = async (payload: {
    address: string;
    lat: number;
    lng: number;
  }) => {
    if (!restaurantId) return;
    setDeliveryLocation((prev) => ({
      ...prev,
      address: payload.address,
      lat: payload.lat,
      lng: payload.lng,
    }));
    setDeliveryLoading(true);
    setDeliveryError(null);
    setError('');
    setDeliveryFee(null);
    setBillableDistanceKm(null);

    try {
      const quote = await fetchDeliveryQuote({
        restaurantId,
        latitude: payload.lat,
        longitude: payload.lng,
      });
      setDeliveryFee(quote.deliveryFee);
      setBillableDistanceKm(quote.billableDistanceKm);
    } catch (err) {
      setDeliveryFee(null);
      setBillableDistanceKm(null);
      setDeliveryError(err instanceof Error ? err.message : uz.orderFailed);
    } finally {
      setDeliveryLoading(false);
    }
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
          subtotal: total(),
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !items.length) return;

    const locationError = validateDeliveryLocation(deliveryLocation);
    if (locationError) {
      setError(locationError);
      return;
    }
    if (deliveryFee == null || deliveryLoading || deliveryError) {
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
          phone: loggedIn?.phone ?? phone,
          customerId: loggedIn?.id,
          deliveryAddress: address,
          latitude: deliveryLocation.lat,
          longitude: deliveryLocation.lng,
          comment: comment || undefined,
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

  const deliveryQuoted = deliveryFee != null && !deliveryLoading && !deliveryError;
  const canPlaceOrder =
    !loading &&
    !deliveryLoading &&
    deliveryQuoted &&
    phone.trim().length > 0;

  if (!items.length) {
    return (
      <main className={mainClass}>
        <div className="mt-8 text-center">
          <p className="text-lg font-medium">{uz.cartEmpty}</p>
          <Link href="/" className="mt-4 inline-block text-brand-600">
            {uz.browseRestaurants}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={mainClass}>
      <h1 className="text-xl font-bold">{uz.checkoutTitle}</h1>
      <p className="mt-1 text-sm text-zinc-500">{uz.noAccountRequired}</p>

      <ul className="mt-4 space-y-2 rounded-2xl border bg-white p-4 shadow-card">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatSum(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder={uz.promoCode}
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
        />
        <Button type="button" variant="secondary" onClick={applyPromo} disabled={validatingPromo}>
          {validatingPromo ? '...' : uz.apply}
        </Button>
      </div>
      {promoMessage && <p className="mt-2 text-sm text-brand-600">{promoMessage}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input
          required
          type="tel"
          placeholder={uz.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <DeliveryLocation
          value={deliveryLocation}
          onChange={setDeliveryLocation}
          onCalculate={calculateDelivery}
          calculating={deliveryLoading}
          quoted={deliveryQuoted}
          onError={setError}
        />

        {deliveryError && (
          <p className="text-sm text-red-500">{deliveryError}</p>
        )}

        {deliveryQuoted && (
          <>
            <DeliveryQuoteBanner
              loading={false}
              error={null}
              billableDistanceKm={billableDistanceKm}
              deliveryFee={deliveryFee}
            />
            <CheckoutTotals
              subtotal={total()}
              deliveryFee={deliveryFee}
              promoDiscount={promoDiscount}
            />
          </>
        )}

        <textarea
          placeholder={uz.commentOptional}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!canPlaceOrder && !loading && (
          <p className="text-xs text-zinc-500">{uz.deliveryPriceRequired}</p>
        )}
        <Button type="submit" size="lg" disabled={!canPlaceOrder} className="w-full">
          {loading ? uz.placingOrder : uz.placeOrder}
        </Button>
      </form>
    </main>
  );
}
