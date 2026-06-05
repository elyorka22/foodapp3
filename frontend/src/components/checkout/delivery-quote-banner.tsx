'use client';

import { MapPin } from 'lucide-react';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Props = {
  loading: boolean;
  error: string | null;
  billableDistanceKm: number | null;
  deliveryFee: number | null;
};

export function DeliveryQuoteBanner({
  loading,
  error,
  billableDistanceKm,
  deliveryFee,
}: Props) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center text-sm font-medium text-brand-800">
        {uz.deliveryCalculating}
      </div>
    );
  }

  if (deliveryFee == null || billableDistanceKm == null) return null;

  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
      <div className="flex items-start gap-3">
        <MapPin size={20} className="mt-0.5 shrink-0 text-green-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-green-900">{uz.deliveryPriceCalculated}</p>
          <p className="mt-1 text-sm text-green-800">{uz.distanceKm(billableDistanceKm)}</p>
          <p className="mt-2 text-xl font-bold text-green-900">
            {uz.deliveryLabel}: {formatSum(deliveryFee)}
          </p>
        </div>
      </div>
    </div>
  );
}
