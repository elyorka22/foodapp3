'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { api } from '@/lib/api';
import { getCustomer, saveTrackingToken } from '@/lib/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

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
      setError(uz.geolocationUnsupported);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setError('');
      },
      () => setError(uz.geolocationFailed),
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
      setError(err instanceof Error ? err.message : uz.orderFailed);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto max-w-lg p-4">
        <p>{uz.cartEmpty}</p>
        <Link href="/" className="mt-2 inline-block text-brand-600">
          {uz.browseRestaurants}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link href="/cart" className="text-sm text-brand-600">
        ← {uz.back}
      </Link>
      <h1 className="mt-2 text-xl font-bold">{uz.checkoutTitle}</h1>
      <p className="text-sm text-zinc-500">{uz.noAccountRequired}</p>

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
        <textarea
          required
          placeholder={uz.deliveryAddress}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
        />
        <button type="button" onClick={useMyLocation} className="text-sm text-brand-600">
          📍 {uz.useGps}
        </button>
        <textarea
          placeholder={uz.commentOptional}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? uz.placingOrder : uz.placeOrder}
        </Button>
      </form>
    </main>
  );
}
