'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  customerNeedsPhone,
  getCustomer,
  getCustomerToken,
  isCustomerLoggedIn,
  setCustomerAuth,
  type CustomerProfile,
} from '@/lib/customer';
import {
  DeliveryLocation,
  validateDeliveryLocation,
  type DeliveryLocationValue,
} from '@/components/checkout/delivery-location';
import { uz } from '@/lib/uz';

type AuthResponse = { accessToken: string; user: CustomerProfile };

export default function CompleteProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationValue>({
    address: '',
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace('/auth/login');
      return;
    }
    if (!customerNeedsPhone()) {
      router.replace('/');
      return;
    }
    const c = getCustomer();
    if (c?.defaultDeliveryAddress) {
      setDeliveryLocation((prev) => ({ ...prev, address: c.defaultDeliveryAddress! }));
    }
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const locationError = deliveryLocation.address.trim()
      ? validateDeliveryLocation(deliveryLocation)
      : null;
    if (locationError) {
      setError(locationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = { phone };
      if (deliveryLocation.address.trim()) {
        body.deliveryAddress = deliveryLocation.address.trim();
        body.latitude = deliveryLocation.lat;
        body.longitude = deliveryLocation.lng;
      }
      const res = await api<AuthResponse>('/customers/complete-profile', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      });
      setCustomerAuth(res.accessToken, res.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <h1 className="text-2xl font-bold text-zinc-900">{uz.completeProfileTitle}</h1>
      <p className="mt-2 text-sm text-zinc-500">{uz.completeProfileHint}</p>

      <Card className="mt-6 space-y-4 p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">{uz.phone}</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">
              {uz.deliveryAddress} ({uz.optional})
            </p>
            <DeliveryLocation value={deliveryLocation} onChange={setDeliveryLocation} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? uz.saving : uz.saveAndContinue}
          </Button>
        </form>
      </Card>
    </main>
  );
}
