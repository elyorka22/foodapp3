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

    setLoading(true);
    setError('');

    try {
      const loggedIn = getCustomer();
      const token = getCustomerToken();
      if (loggedIn && customerNeedsPhone()) {
        router.replace('/complete-profile');
        return;
      }
      const res = await api<{ order: { trackingToken: string; orderNumber?: string } }>('/orders/guest', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          restaurantId,
          phone: loggedIn?.phone ?? phone,
          customerId: loggedIn?.id,
          deliveryAddress: deliveryLocation.address.trim(),
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
      <p className="mt-3 font-semibold">
        {uz.subtotal}: {formatSum(total())}
        {promoDiscount > 0 && (
          <span className="ml-2 text-green-600">−{formatSum(promoDiscount)}</span>
        )}
        {' '}
        + {uz.deliveryFee}
      </p>

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
      {promoMessage && <p className="text-sm text-brand-600">{promoMessage}</p>}

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
          onError={setError}
        />
        <textarea
          placeholder={uz.commentOptional}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? uz.placingOrder : uz.placeOrder}
        </Button>
      </form>
    </main>
  );
}
