'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminBranches, type BranchForm } from '@/hooks/use-admin-branches';
import { useAdminCities } from '@/hooks/use-admin-cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

const empty: BranchForm = {
  name: '',
  address: '',
  cityId: '',
  latitude: 41.31,
  longitude: 69.24,
  phone: '',
  isActive: true,
  isPrimary: false,
};

export function AdminBranchesPanel({ businessId }: { businessId: string }) {
  const { list, create, update, setPrimary, remove } = useAdminBranches(businessId);
  const cities = useAdminCities();
  const [form, setForm] = useState<BranchForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = list.data ?? [];

  const submit = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.cityId) {
      toast.error('Nom, manzil va shahar majburiy');
      return;
    }
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: form });
        setEditId(null);
        toast.success('Filial saqlandi');
      } else {
        await create.mutateAsync(form);
        toast.success("Filial qo'shildi");
      }
      setForm(empty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <div>
        <h2 className="text-sm font-semibold">Filiallar</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Bir brend bir necha shaharda — har filial o‘z shahri bilan. Katalog shahar
          bo‘yicha filialni tanlaydi.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Manzil"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <select
          className="rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={form.cityId}
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
          placeholder="Lat"
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
        />
        <Input
          type="number"
          step="any"
          placeholder="Lng"
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
        />
        <Input
          placeholder="Telefon"
          value={form.phone ?? ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={submit} disabled={create.isPending || update.isPending}>
          {editId ? 'Saqlash' : "Filial qo'shish"}
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

      <ul className="divide-y dark:divide-white/10">
        {rows.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="text-sm font-medium">
                {b.name}
                {b.isPrimary ? (
                  <span className="ml-2 text-xs text-emerald-600">asosiy</span>
                ) : null}
              </p>
              <p className="text-xs text-zinc-500">
                {b.city?.name ?? '—'} · {b.address}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActiveBadge active={b.isActive} />
              {!b.isPrimary ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimary.mutateAsync(b.id).then(() => toast.success('Asosiy qilindi'))}
                >
                  Asosiy
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditId(b.id);
                  setForm({
                    name: b.name,
                    address: b.address,
                    cityId: b.cityId,
                    latitude: Number(b.latitude),
                    longitude: Number(b.longitude),
                    phone: b.phone ?? '',
                    isActive: b.isActive,
                    isPrimary: b.isPrimary,
                  });
                }}
              >
                Tahrir
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => setDeleteId(b.id)}>
                O‘chirish
              </Button>
            </div>
          </li>
        ))}
        {!rows.length && list.isSuccess ? (
          <li className="py-3 text-sm text-zinc-500">Filiallar yo‘q</li>
        ) : null}
      </ul>

      <ConfirmDialog
        open={!!deleteId}
        title="Filialni o‘chirish"
        description="Oxirgi faol filialni o‘chirib bo‘lmaydi."
        confirmText="O‘chirish"
        danger
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await remove.mutateAsync(deleteId);
            setDeleteId(null);
            toast.success("O'chirildi");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Xatolik');
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
