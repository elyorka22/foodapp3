'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  latitude?: number | null;
  longitude?: number | null;
  onClose: () => void;
  onSave: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [41.3111, 69.2797];

export function MapLocationPicker({ open, latitude, longitude, onClose, onSave }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ map: { remove: () => void }; marker: unknown } | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPicked(
      latitude != null && longitude != null
        ? { lat: latitude, lng: longitude }
        : null,
    );
  }, [open, latitude, longitude]);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    let cancelled = false;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as { L?: unknown }).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load map'));
          document.body.appendChild(script);
        });
      }

      if (cancelled || !mapRef.current) return;

      const L = (window as unknown as { L: any }).L;
      if (mapInstance.current) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }

      const center: [number, number] =
        latitude != null && longitude != null
          ? [latitude, longitude]
          : DEFAULT_CENTER;

      const map = L.map(mapRef.current).setView(center, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);

      const setCoords = (lat: number, lng: number) => {
        setPicked({ lat, lng });
        marker.setLatLng([lat, lng]);
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords(pos.lat, pos.lng);
      });

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        setCoords(e.latlng.lat, e.latlng.lng);
      });

      mapInstance.current = { map, marker };
      setReady(true);
    };

    loadLeaflet().catch(() => setReady(false));

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }
      setReady(false);
    };
  }, [open, latitude, longitude]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close map"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Pick location on map</p>
            <p className="text-xs text-zinc-500">Click map or drag marker to set coordinates</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border p-2 dark:border-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div
          ref={mapRef}
          className="h-80 w-full rounded-lg border dark:border-white/10"
          style={{ minHeight: 320 }}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
            {picked
              ? `${picked.lat.toFixed(6)}, ${picked.lng.toFixed(6)}`
              : ready
                ? 'Click map to set location'
                : 'Loading map...'}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!picked}
              onClick={() => {
                if (picked) onSave(picked.lat, picked.lng);
                onClose();
              }}
            >
              Save location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
