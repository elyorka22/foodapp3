'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/ui';
import { DeliveryCoords } from '@/components/shared/delivery-coords';
import { OrderLineItems } from '@/components/orders/order-line-items';

type CourierOption = {
  id: string;
  isOnline?: boolean;
  user?: { fullName?: string; phone?: string };
  stats?: { activeOrders?: number };
};

export function OrderDrawer({
  orderId,
  open,
  onClose,
  load,
  loadHistory,
  onChangeStatus,
  couriers = [],
  onAssignCourier,
  onReassignCourier,
  onRemoveCourier,
  courierActionPending = false,
}: {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  load: (id: string) => Promise<any>;
  loadHistory?: (id: string) => Promise<any[]>;
  onChangeStatus: (id: string, status: string) => Promise<void> | void;
  couriers?: CourierOption[];
  onAssignCourier?: (orderId: string, courierId: string) => Promise<void>;
  onReassignCourier?: (orderId: string, courierId: string) => Promise<void>;
  onRemoveCourier?: (orderId: string) => Promise<void>;
  courierActionPending?: boolean;
}) {
  const [data, setData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState('');

  const refresh = () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    Promise.all([
      load(orderId),
      loadHistory ? loadHistory(orderId) : Promise.resolve([]),
    ])
      .then(([order, hist]) => {
        setData(order);
        setHistory(hist);
        setSelectedCourierId(order?.courier?.id ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !orderId) return;
    refresh();
  }, [open, orderId, load, loadHistory]);

  const timeline = useMemo(() => {
    if (history.length) {
      return history.map((h) => ({
        label: h.status,
        at: h.createdAt,
        note: h.note,
        by: h.changedBy?.fullName,
      }));
    }
    if (!data) return [];
    return [
      { label: 'PENDING', at: data.createdAt, note: 'Order placed' },
      ...(data.acceptedAt ? [{ label: 'ACCEPTED', at: data.acceptedAt }] : []),
      ...(data.deliveredAt ? [{ label: 'DELIVERED', at: data.deliveredAt }] : []),
    ];
  }, [data, history]);

  const hasCourier = !!data?.courier?.id;
  const waitingInPool =
    data &&
    !hasCourier &&
    data.status === 'PREPARING' &&
    !!data.courierRequestedAt;
  const canReassign =
    hasCourier &&
    data &&
    ['PREPARING', 'COURIER_ASSIGNED'].includes(data.status);

  const handleCourierAction = async () => {
    if (!orderId || !selectedCourierId || !data || !hasCourier) return;
    if (data.courier?.id === selectedCourierId) return;
    if (onReassignCourier) {
      await onReassignCourier(orderId, selectedCourierId);
    }
    refresh();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-xl dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs opacity-60">Order details</p>
            <h2 className="mt-1 text-lg font-bold">{data?.orderNumber ?? '...'}</h2>
            {data?.status && (
              <div className="mt-2">
                <StatusBadge status={data.status} />
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border p-2 dark:border-white/10" aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {loading && <p className="mt-6 text-sm opacity-70">Loading...</p>}
        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        {data && (
          <div className="mt-6 space-y-6">
            <Section title="Customer">
              <p className="text-sm font-medium">{data.guestOrder?.customer?.fullName ?? 'Guest'}</p>
              <p className="text-sm opacity-70">{data.guestOrder?.phone}</p>
            </Section>

            <Section title="Delivery">
              <p className="text-sm">{data.address?.line1 ?? data.guestOrder?.deliveryAddress}</p>
              {data.distanceKm != null && (
                <p className="mt-2 text-sm">
                  Distance: <span className="font-medium">{Number(data.distanceKm)} km</span>
                </p>
              )}
              <p className="mt-1 text-sm">
                Delivery fee:{' '}
                <span className="font-medium">
                  {Number(data.deliveryFee ?? 0).toLocaleString()} UZS
                </span>
              </p>
              <div className="mt-3 space-y-2 text-xs opacity-80">
                <p>
                  Restaurant:{' '}
                  {data.restaurantLatitude != null && data.restaurantLongitude != null
                    ? `${Number(data.restaurantLatitude).toFixed(5)}, ${Number(data.restaurantLongitude).toFixed(5)}`
                    : '—'}
                </p>
                <p>
                  Customer:{' '}
                  {data.customerLatitude != null && data.customerLongitude != null
                    ? `${Number(data.customerLatitude).toFixed(5)}, ${Number(data.customerLongitude).toFixed(5)}`
                    : '—'}
                </p>
              </div>
              <DeliveryCoords
                className="mt-2"
                lat={data.customerLatitude ?? data.address?.latitude}
                lng={data.customerLongitude ?? data.address?.longitude}
                guestLat={data.guestOrder?.latitude}
                guestLng={data.guestOrder?.longitude}
              />
            </Section>

            <Section title="Items">
              <OrderLineItems items={data.items ?? []} showSubtotal />
              <div className="mt-3 border-t pt-3 text-sm dark:border-white/10">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{Number(data.subtotal).toLocaleString()} UZS</span>
                </p>
                <p className="flex justify-between opacity-80">
                  <span>Delivery</span>
                  <span>{Number(data.deliveryFee).toLocaleString()} UZS</span>
                </p>
                <p className="mt-1 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{Number(data.total).toLocaleString()} UZS</span>
                </p>
              </div>
            </Section>

            <Section title="Courier">
              <p className="text-sm font-medium">
                {data.courier?.name ?? data.courier?.user?.fullName ?? 'Not assigned'}
              </p>
              {(data.courier?.phone ?? data.courier?.user?.phone) && (
                <p className="text-sm opacity-70">{data.courier?.phone ?? data.courier?.user?.phone}</p>
              )}
              {waitingInPool && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  Restoran kuryerni chaqirdi — barcha kuryerlar buyurtmani ko&apos;rmoqda.
                </p>
              )}
              {canReassign && onReassignCourier && (
                <div className="mt-3 space-y-2">
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
                    value={selectedCourierId}
                    onChange={(e) => setSelectedCourierId(e.target.value)}
                  >
                    <option value="">Select courier</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.user?.fullName ?? 'Courier'}
                        {c.isOnline ? ' · online' : ' · offline'}
                        {c.stats?.activeOrders != null ? ` · ${c.stats.activeOrders} active` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!selectedCourierId || courierActionPending}
                      onClick={handleCourierAction}
                    >
                      Reassign courier
                    </Button>
                    {hasCourier && onRemoveCourier && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={courierActionPending}
                        onClick={async () => {
                          await onRemoveCourier(orderId!);
                          refresh();
                        }}
                      >
                        Remove courier
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Status history">
              {!timeline.length ? (
                <p className="text-sm opacity-60">No history yet.</p>
              ) : (
                <ul className="space-y-3 border-l-2 border-brand-500/30 pl-4">
                  {timeline.map((t: any, idx) => (
                    <li key={idx} className="relative text-sm">
                      <span className="absolute -left-[1.35rem] top-1 h-2 w-2 rounded-full bg-brand-500" />
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={t.label} />
                        <span className="text-xs opacity-60">
                          {t.at ? new Date(t.at).toLocaleString() : '—'}
                        </span>
                      </div>
                      {t.by && <p className="text-xs opacity-50">by {t.by}</p>}
                      {t.note && <p className="text-xs opacity-70">{t.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Quick actions">
              <div className="flex flex-wrap gap-2">
                {[
                  'ACCEPTED',
                  'PREPARING',
                  'COURIER_ASSIGNED',
                  'ARRIVED_AT_RESTAURANT',
                  'PICKED_UP',
                  'DELIVERING',
                  'DELIVERED',
                ].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => onChangeStatus(data.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </Section>
          </div>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2">{children}</div>
    </section>
  );
}
