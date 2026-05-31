'use client';

import { useState } from 'react';
import { uz } from '@/lib/uz';
import { isValidCoords } from '@/lib/maps';

export type LocationMode = 'manual' | 'auto';

export type DeliveryLocationValue = {
  mode: LocationMode;
  address: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  value: DeliveryLocationValue;
  onChange: (value: DeliveryLocationValue) => void;
  onError?: (message: string) => void;
};

export function DeliveryLocation({ value, onChange, onError }: Props) {
  const [detecting, setDetecting] = useState(false);

  const runAutoDetect = (next: DeliveryLocationValue) => {
    if (isValidCoords(next.lat, next.lng)) return;
    if (!navigator.geolocation) {
      onError?.(uz.locationAutoFailed);
      return;
    }
    setDetecting(true);
    onError?.('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...next,
          mode: 'auto',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDetecting(false);
      },
      () => {
        onError?.(uz.locationAutoFailed);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const setMode = (mode: LocationMode) => {
    const next = { ...value, mode };
    onChange(next);
    onError?.('');
    if (mode === 'auto') {
      runAutoDetect(next);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            value.mode === 'manual'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {uz.locationManual}
        </button>
        <button
          type="button"
          onClick={() => setMode('auto')}
          disabled={detecting}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition disabled:opacity-60 ${
            value.mode === 'auto'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {detecting && value.mode === 'auto' ? uz.detectingLocation : uz.locationAuto}
        </button>
      </div>

      <textarea
        required
        placeholder={uz.deliveryAddress}
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        rows={3}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
      />
    </div>
  );
}

export function validateDeliveryLocation(value: DeliveryLocationValue): string | null {
  if (!value.address.trim()) return uz.deliveryAddressRequired;
  if (value.mode === 'auto' && !isValidCoords(value.lat, value.lng)) {
    return uz.locationAutoFailed;
  }
  return null;
}
