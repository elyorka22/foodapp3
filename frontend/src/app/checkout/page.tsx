'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import { getCustomer, saveTrackingToken } from '@/lib/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, total, clear } = useCartStore();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [lat, setLat] = useState(41.311081);
  const [lng, setLng] = useState(69.240562);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const c = getCustomer();
    if (c?.phone) setPhone(c.phone);
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setError('');
      },
      () => setError('Could not get location'),
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
          subtotal: total(),
          customerId: getCustomer()?.id,
        }),
      });
      if (res.valid) {
        setPromoDiscount(res.discount);
        setPromoMessage(`Discount: ${res.discount.toLocaleString()} UZS`);
      } else {
        setPromoDiscount(0);
        setPromoMessage(res.message ?? 'Invalid promo code');
      }
    } catch (err) {
      setPromoDiscount(0);
      setPromoMessage(err instanceof Error ? err.message : 'Could not validate promo');
    } finally {
      setValidatingPromo(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !items.length) return;
    setLoading(true);
    setError('');
    try {
      const loggedIn = getCustomer();
      const res = await api<{ order: { trackingToken: string; orderNumber?: string } }>('/orders/guest', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId,
          phone: loggedIn?.phone ?? phone,
          customerId: loggedIn?.id,
          deliveryAddress: address,
          latitude: lat,
          longitude: lng,
          comment: comment || undefined,
          promoCode: promoCode.trim() || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      saveTrackingToken(res.order.trackingToken, res.order.orderNumber);
      clear();
      router.push(`/track/${res.order.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto max-w-lg p-4">
        <p>Cart is empty.</p>
        <Link href="/" className="mt-2 inline-block text-brand-600">
          Browse restaurants
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link href="/" className="text-sm text-brand-600">
        ← Back
      </Link>
      <h1 className="mt-2 text-xl font-bold">Checkout</h1>
      <p className="text-sm opacity-70">No account required</p>

      <ul className="mt-4 space-y-2 rounded-xl border p-4 dark:border-white/10">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{(i.price * i.quantity).toLocaleString()} UZS</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-semibold">
        Subtotal: {total().toLocaleString()} UZS
        {promoDiscount > 0 && (
          <span className="ml-2 text-green-600">
            −{promoDiscount.toLocaleString()} UZS promo
          </span>
        )}
        {' '}
        + delivery
      </p>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
        />
        <Button type="button" variant="secondary" onClick={applyPromo} disabled={validatingPromo}>
          {validatingPromo ? '...' : 'Apply'}
        </Button>
      </div>
      {promoMessage && <p className="text-sm text-brand-600">{promoMessage}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input
          required
          type="tel"
          placeholder="Phone (+998901234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          required
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-4 py-3 dark:border-white/20 dark:bg-zinc-900"
        />
        <button type="button" onClick={useMyLocation} className="text-sm text-brand-600">
          📍 Use my GPS location
        </button>
        <textarea
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full rounded-lg border px-4 py-3 dark:border-white/20 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Placing order...' : 'Place order'}
        </Button>
      </form>
    </main>
  );
}
