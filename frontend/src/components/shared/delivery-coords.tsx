'use client';

import { formatCoords, googleMapsUrl, yandexMapsUrl } from '@/lib/maps';
import { uz } from '@/lib/uz';

type Props = {
  lat?: number | string | null;
  lng?: number | string | null;
  /** guestOrder fallback when address is missing */
  guestLat?: number | string | null;
  guestLng?: number | string | null;
  className?: string;
};

function toNum(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function DeliveryCoords({ lat, lng, guestLat, guestLng, className = '' }: Props) {
  const latitude = toNum(lat) ?? toNum(guestLat);
  const longitude = toNum(lng) ?? toNum(guestLng);

  if (latitude == null || longitude == null) {
    return <p className={`text-xs text-amber-600 ${className}`}>{uz.coordsMissing}</p>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs text-zinc-500">
        {uz.coordsLabel}: {formatCoords(latitude, longitude)}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={googleMapsUrl(latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-brand-600 underline"
        >
          Google Maps
        </a>
        <a
          href={yandexMapsUrl(latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-brand-600 underline"
        >
          Yandex Maps
        </a>
      </div>
    </div>
  );
}
