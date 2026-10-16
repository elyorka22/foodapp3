'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminCities } from '@/hooks/use-admin-cities';
import {
  useAdminDeliveryZones,
  type DeliveryZoneForm,
} from '@/hooks/use-admin-delivery-zones';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/ui';

const empty: DeliveryZoneForm = {
  name: '',
  cityId: '',
  centerLatitude: 41.31,
  centerLongitude: 69.24,
  radiusKm: 5,
  baseFee: 8000,
  pricePerKm: 1500,
  minDeliveryFee: 5000,
  isActive: true,
};

export function AdminDeliveryZonesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'settings' });
  const cities = useAdminCities();
  const [cityFilter, setCityFilter] = useState('');
  const { list, create, update, remove } = useAdminDeliveryZones(
    cityFilter || undefined,
  );
  const [form, setForm] = useState<DeliveryZoneForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!ready || !authorized) return null;

  const rows = list.data ?? [];

  const submit = async () => {
    if (!form.name.trim() || !form.cityId) {
      toast.error('Nom va shahar majburiy');
      return;
    }
    let polygon: Record<string, unknown> | number[][] | undefined;
    if (form.polygonJson?.trim()) {
      try {
        polygon = JSON.parse(form.polygonJson) as Record<string, unknown>;
      } catch {
        toast.error('Polygon JSON noto‘g‘ri');
        return;
      }
    }
    const hasCircle =
      form.radiusKm != null &&
      form.centerLatitude != null &&
      form.centerLongitude != null;
    if (!hasCircle && !polygon) {
      toast.error('Doira (markaz + radius) yoki polygon JSON kiriting');
      return;
    }
    const body = {
      name: form.name,
      cityId: form.cityId,
      centerLatitude: form.centerLatitude,
      centerLongitude: form.centerLongitude,
      radiusKm: form.radiusKm,
      polygon,
      baseFee: form.baseFee,
      pricePerKm: form.pricePerKm,
      minDeliveryFee: form.minDeliveryFee,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body });
        setEditId(null);
        toast.success('Saqlandi');
      } else {
        await create.mutateAsync(body);
        toast.success("Zona qo'shildi");
      }
      setForm(empty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Yetkazib berish zonalari</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Shahar (yoki keyinroq biznes/filial) bo‘yicha doira: markaz + radius km.
          Buyurtma manzili zona ichida bo‘lsa — yetkaziladi.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">
          {editId ? 'Zonani tahrirlash' : 'Yangi zona (doira)'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={form.cityId ?? ''}
            onChange={(e) => setForm({ ...form, cityId: e.target.value })}
          >
            <option value="">Shahar…</option>
            {(cities.list.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            step="any"
            placeholder="Radius (km)"
            value={form.radiusKm ?? ''}
            onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })}
          />
          <Input
            type="number"
            step="any"
            placeholder="Markaz lat"
            value={form.centerLatitude ?? ''}
            onChange={(e) =>
              setForm({ ...form, centerLatitude: Number(e.target.value) })
            }
          />
          <Input
            type="number"
            step="any"
            placeholder="Markaz lng"
            value={form.centerLongitude ?? ''}
            onChange={(e) =>
              setForm({ ...form, centerLongitude: Number(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Base fee"
            value={form.baseFee}
            onChange={(e) => setForm({ ...form, baseFee: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Per km"
            value={form.pricePerKm}
            onChange={(e) => setForm({ ...form, pricePerKm: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Min fee"
            value={form.minDeliveryFee}
            onChange={(e) =>
              setForm({ ...form, minDeliveryFee: Number(e.target.value) })
            }
          />
          <label className="block text-xs font-medium opacity-70 sm:col-span-2 lg:col-span-3">
            Polygon GeoJSON (ixtiyoriy — doira o‘rniga)
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs dark:border-white/20 dark:bg-zinc-900"
              rows={4}
              placeholder='{"type":"Polygon","coordinates":[[[lng,lat],...]]}'
              value={form.polygonJson ?? ''}
              onChange={(e) => setForm({ ...form, polygonJson: e.target.value })}
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button type="button" onClick={submit}>
            {editId ? 'Saqlash' : "Qo'shish"}
          </Button>
          {editId ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
            >
              Bekor
            </Button>
          ) : null}
        </div>
      </div>

      <select
        className="rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        value={cityFilter}
        onChange={(e) => setCityFilter(e.target.value)}
      >
        <option value="">Barcha shaharlar</option>
        {(cities.list.data ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {!rows.length ? (
        <EmptyState title="Zonalar yo‘q" description="Yuqoridan doira zona qo‘shing." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-zinc-500 dark:border-white/10">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Shahar</th>
                <th className="px-4 py-3">Radius</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((z) => (
                <tr key={z.id} className="border-b last:border-0 dark:border-white/10">
                  <td className="px-4 py-3 font-medium">{z.name}</td>
                  <td className="px-4 py-3">{z.city?.name ?? '—'}</td>
                  <td className="px-4 py-3">{z.radiusKm != null ? `${z.radiusKm} km` : 'polygon'}</td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={z.isActive !== false} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditId(z.id);
                          setForm({
                            name: z.name,
                            cityId: z.cityId ?? z.city?.id ?? '',
                            centerLatitude: z.centerLatitude,
                            centerLongitude: z.centerLongitude,
                            radiusKm: z.radiusKm,
                            baseFee: z.baseFee,
                            pricePerKm: z.pricePerKm,
                            minDeliveryFee: z.minDeliveryFee,
                            isActive: z.isActive,
                          });
                        }}
                      >
                        Tahrir
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(z.id)}>
                        O‘chirish
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Zonani o‘chirish"
        confirmText="O‘chirish"
        danger
        onConfirm={async () => {
          if (!deleteId) return;
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
          toast.success("O'chirildi");
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
