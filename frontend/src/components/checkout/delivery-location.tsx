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

type Props = {
  value: DeliveryLocationValue;
  onChange: (value: DeliveryLocationValue) => void;
  onError?: (message: string) => void;
};

export function DeliveryLocation({ value, onChange, onError }: Props) {
  const [sending, setSending] = useState(false);
  const locationSent = isValidCoords(value.lat, value.lng);

  const sendLocation = () => {
    if (!navigator.geolocation) {
      onError?.(uz.locationSendFailed);
      return;
    }
    setSending(true);
    onError?.('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...value,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSending(false);
      },
      () => {
        onError?.(uz.locationSendFailed);
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-3">
      <textarea
        required
        placeholder={uz.deliveryAddress}
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        rows={3}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"
      />

      <button
        type="button"
        onClick={sendLocation}
        disabled={sending}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
          locationSent
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
        }`}
      >
        <MapPin size={18} aria-hidden />
        {sending
          ? uz.detectingLocation
          : locationSent
            ? uz.locationSent
            : uz.sendLocation}
      </button>
    </div>
  );
}

export function validateDeliveryLocation(value: DeliveryLocationValue): string | null {
  if (!value.address.trim()) return uz.deliveryAddressRequired;
  if (!isValidCoords(value.lat, value.lng)) return uz.locationRequired;
  return null;
}
