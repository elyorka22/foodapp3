'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/ui';

export function OrderDrawer({
  orderId,
  open,
  onClose,
  load,
  onChangeStatus,
}: {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  load: (id: string) => Promise<any>;
  onChangeStatus: (id: string, status: string) => Promise<void> | void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    setError('');
    setData(null);
    load(orderId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [open, orderId, load]);

  const timeline = useMemo(() => {
    if (!data) return [];
    const items: Array<{ label: string; at?: string | null }> = [
      { label: 'Created', at: data.createdAt },
      { label: 'Accepted', at: data.acceptedAt },
      { label: 'Delivered', at: data.deliveredAt },
      ...(data.status === 'CANCELLED' ? [{ label: 'Cancelled', at: data.updatedAt }] : []),
    ];
    return items.filter(Boolean);
  }, [data]);

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
              <p className="text-xs opacity-60">
                Lat/Lng: {data.address?.latitude}, {data.address?.longitude}
              </p>
            </Section>

            <Section title="Items">
              <ul className="space-y-2">
                {data.items?.map((i: any) => (
                  <li key={i.id} className="flex justify-between text-sm">
                    <span>
                      {i.name} × {i.quantity}
                    </span>
                    <span>{Number(i.subtotal).toLocaleString()} UZS</span>
                  </li>
                ))}
              </ul>
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
              <p className="text-sm">
                {data.courier?.user?.fullName ?? 'Not assigned'}
              </p>
            </Section>

            <Section title="Timeline">
              <ul className="space-y-2 text-sm">
                {timeline.map((t, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{t.label}</span>
                    <span className="opacity-60">{t.at ? new Date(t.at).toLocaleString() : '—'}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Quick actions">
              <div className="flex flex-wrap gap-2">
                {['ACCEPTED', 'PREPARING', 'COURIER_ASSIGNED', 'PICKED_UP', 'DELIVERING', 'DELIVERED'].map((s) => (
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

