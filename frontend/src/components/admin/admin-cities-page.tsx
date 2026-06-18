'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminCities, type CityForm } from '@/hooks/use-admin-cities';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveFormSlug } from '@/lib/slugify';

const emptyForm: CityForm = {
  name: '',
  slug: '',
  sortOrder: 0,
  isActive: true,
  isDefault: false,
};

export function AdminCitiesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'settings' });
  const { list, create, update, remove } = useAdminCities();
  const [form, setForm] = useState<CityForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!ready || !authorized) return null;

  const rows = list.data ?? [];

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Shahar nomini kiriting');
      return;
    }
    const body = {
      ...form,
      slug: resolveFormSlug(form.name, editId ? form.slug : undefined),
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body });
        setEditId(null);
        toast.success('Saqlandi');
      } else {
        await create.mutateAsync(body);
        toast.success('Shahar qo‘shildi');
      }
      setForm(emptyForm);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const startEdit = (row: (typeof rows)[0]) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      isDefault: row.isDefault,
    });
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await update.mutateAsync({ id, body: { isActive: !isActive } });
      toast.success(isActive ? 'Nofaol qilindi' : 'Faollashtirildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const setDefault = async (id: string) => {
    try {
      await update.mutateAsync({ id, body: { isDefault: true } });
      toast.success('Asosiy shahar belgilandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('O‘chirildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Shaharlar</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mijoz ilovasida yuqorida ko‘rinadigan shaharlar ro‘yxati. Hozircha xizmat Chustdan
          boshlanadi — keyinchalik boshqa shaharlar qo‘shiladi.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">{editId ? 'Shaharni tahrirlash' : 'Yangi shahar'}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Nom (masalan: Chust)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Tartib"
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Faol
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              />
              Asosiy
            </label>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            {editId ? 'Saqlash' : 'Qo‘shish'}
          </Button>
          {editId ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              Bekor
            </Button>
          ) : null}
        </div>
      </div>

      {list.isLoading ? (
        <p className="text-sm text-zinc-500">Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Shaharlar yo‘q" description="Birinchi shaharni qo‘shing — masalan, Chust." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Shahar</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Tartib</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium">Asosiy</th>
                <th className="px-4 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{row.slug}</td>
                  <td className="px-4 py-3">{row.sortOrder}</td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={row.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    {row.isDefault ? (
                      <span className="text-xs font-semibold text-emerald-600">Asosiy</span>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setDefault(row.id)}>
                        Asosiy qilish
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
                        Tahrirlash
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleActive(row.id, row.isActive)}>
                        {row.isActive ? 'O‘chirish' : 'Yoqish'}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(row.id)}>
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
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Shaharni o‘chirish"
        description="Shahar ro‘yxatdan olib tashlanadi. Davom etasizmi?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
