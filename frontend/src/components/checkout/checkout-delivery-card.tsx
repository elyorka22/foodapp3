'use client';

import { Clock, MapPin, Sparkles, Truck } from 'lucide-react';
import { clsx } from 'clsx';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import type { DeliveryLocationValue } from './delivery-location';

type Props = {
  value: DeliveryLocationValue;
  calculating?: boolean;
  quoted?: boolean;
  deliveryFee: number | null;
  billableDistanceKm: number | null;
  deliveryError?: string | null;
  onRecalculate?: () => void;
};

function estimateEtaMinutes(distanceKm: number): number {
  return Math.min(60, Math.max(15, Math.round(18 + distanceKm * 5)));
}

export function CheckoutDeliveryCard({
  value,
  calculating = false,
  quoted = false,
  deliveryFee,
  billableDistanceKm,
  deliveryError,
  onRecalculate,
}: Props) {
  const busy = calculating;
  const eta =
    quoted && billableDistanceKm != null ? estimateEtaMinutes(billableDistanceKm) : null;

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-[24px] shadow-[0_12px_40px_rgba(255,122,0,0.12)]',
        quoted
          ? 'bg-gradient-to-br from-[#FFF4E8] via-[#FFF7F0] to-[#FFEDD5]'
          : 'bg-gradient-to-br from-[#FFF7F0] to-[#FFF4E8]',
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-[#FF7A00] shadow-sm">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#9A3412]">{uz.deliveryLabel}</p>
            <p className="text-[13px] text-[#C2410C]/80">{uz.deliveryPriceHint}</p>
          </div>
        </div>

        {quoted ? (
          <div className="mt-4 space-y-3 rounded-[20px] bg-white/70 p-4 backdrop-blur-sm">
            {value.address.trim() ? (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#FF7A00]" />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#C2410C]/70">
                    {uz.deliveryAddress}
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-[#9A3412]">
                    {value.address.trim()}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-[#FF7A00]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#C2410C]/70">
                  {uz.deliveryLabel}
                </p>
                <p className="mt-0.5 text-[20px] font-bold text-[#9A3412]">
                  {deliveryFee != null ? formatSum(deliveryFee) : '—'}
                </p>
              </div>
            </div>
            {eta != null ? (
              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-[#FF7A00]" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#C2410C]/70">
                    Vaqt
                  </p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[#9A3412]">
                    {uz.checkoutEta(eta)}
                  </p>
                </div>
              </div>
            ) : null}
            {billableDistanceKm != null ? (
              <p className="text-[13px] text-[#C2410C]">{uz.distanceKm(billableDistanceKm)}</p>
            ) : null}
          </div>
        ) : null}

        {deliveryError ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {deliveryError}
          </p>
        ) : null}

        {quoted && onRecalculate ? (
          <button
            type="button"
            onClick={onRecalculate}
            disabled={busy}
            className="mt-4 w-full text-center text-[13px] font-semibold text-[#C2410C] underline-offset-2 hover:underline disabled:opacity-50"
          >
            {busy ? uz.deliveryCalculating : uz.recalculateDeliveryPrice}
          </button>
        ) : null}
      </div>
    </div>
  );
}
