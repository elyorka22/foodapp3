'use client';

import { useState } from 'react';
import { uz } from '@/lib/uz';
import { formatCoords, isValidCoords } from '@/lib/maps';

export type LocationMode = 'manual' | 'gps';

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
  const [gpsLoading, setGpsLoading] = useState(false);

  const setMode = (mode: LocationMode) => {
    onChange({ ...value, mode });
    onError?.('');
  };

  const detectGps = () => {
    if (!navigator.geolocation) {
      onError?.(uz.geolocationUnsupported);
      return;
    }
    setGpsLoading(true);
    onError?.('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          ...value,
          mode: 'gps',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      () => {
        onError?.(uz.geolocationFailed);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const coordsReady = isValidCoords(value.lat, value.lng);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700">{uz.deliveryLocationTitle}</p>

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
          onClick={() => setMode('gps')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            value.mode === 'gps'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {uz.locationGps}
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

      {value.mode === 'gps' ? (
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{uz.gpsHint}</p>
          <button
            type="button"
            onClick={detectGps}
            disabled={gpsLoading}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {gpsLoading ? uz.detectingLocation : `📍 ${uz.detectLocation}`}
          </button>
          {coordsReady && value.lat != null && value.lng != null && (
            <p className="text-xs text-green-700">
              {uz.coordsDetected}: {formatCoords(value.lat, value.lng)}
            </p>
          )}
          {!coordsReady && !gpsLoading && (
            <p className="text-xs text-amber-700">{uz.gpsRequiredHint}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">{uz.manualCoordsHint}</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-zinc-600">
              {uz.latitude}
              <input
                type="number"
                step="any"
                min={-90}
                max={90}
                placeholder="41.311081"
                value={value.lat ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange({
                    ...value,
                    lat: v === '' ? null : Number(v),
                  });
                }}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-zinc-600">
              {uz.longitude}
              <input
                type="number"
                step="any"
                min={-180}
                max={180}
                placeholder="69.240562"
                value={value.lng ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange({
                    ...value,
                    lng: v === '' ? null : Number(v),
                  });
                }}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          {coordsReady && value.lat != null && value.lng != null && (
            <p className="text-xs text-zinc-500">
              {uz.coordsLabel}: {formatCoords(value.lat, value.lng)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function validateDeliveryLocation(value: DeliveryLocationValue): string | null {
  if (!value.address.trim()) return uz.deliveryAddressRequired;
  if (!isValidCoords(value.lat, value.lng)) {
    return value.mode === 'gps' ? uz.gpsRequiredHint : uz.manualCoordsRequired;
  }
  return null;
}
