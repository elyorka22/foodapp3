'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { uz } from '@/lib/uz';
import { isValidCoords } from '@/lib/maps';

export type DeliveryLocationValue = {
  address: string;
  lat: number | null;
  lng: number | null;
};

type CalculatePayload = {
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  value: DeliveryLocationValue;
  onChange: (value: DeliveryLocationValue) => void;
  onCalculate?: (payload: CalculatePayload) => void | Promise<void>;
  calculating?: boolean;
  quoted?: boolean;
  onError?: (message: string) => void;
  /** Show optional address textarea (e.g. complete-profile). Hidden on checkout. */
  showAddressInput?: boolean;
};

export function DeliveryLocation({
  value,
  onChange,
  onCalculate,
  calculating = false,
  quoted = false,
  onError,
  showAddressInput = false,
}: Props) {
  const [gettingGps, setGettingGps] = useState(false);
  const busy = gettingGps || calculating;

  const calculate = () => {
    if (!navigator.geolocation) {
      onError?.(uz.locationSendFailed);
      return;
    }
    setGettingGps(true);
    onError?.('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload: CalculatePayload = {
          address: value.address.trim(),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        onChange({ ...value, lat: payload.lat, lng: payload.lng });
        setGettingGps(false);
        if (onCalculate) await onCalculate(payload);
      },
      () => {
        onError?.(uz.locationSendFailed);
        setGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-card">
      <div>
        <p className="text-sm font-semibold">{uz.deliveryLabel}</p>
        <p className="mt-1 text-xs text-zinc-500">{uz.deliveryPriceHint}</p>
      </div>

      {showAddressInput && (
        <textarea
          placeholder={uz.deliveryAddressOptional}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          rows={2}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
        />
      )}

      <button
        type="button"
        onClick={calculate}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition disabled:opacity-60 ${
          quoted
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
        }`}
      >
        <MapPin size={18} aria-hidden />
        {busy
          ? onCalculate
            ? uz.deliveryCalculating
            : uz.detectingLocation
          : quoted
            ? uz.recalculateDeliveryPrice
            : onCalculate
              ? uz.calculateDeliveryPrice
              : uz.sendLocation}
      </button>
    </div>
  );
}

export function validateDeliveryLocation(value: DeliveryLocationValue): string | null {
  if (!isValidCoords(value.lat, value.lng)) return uz.deliveryPriceRequired;
  return null;
}
