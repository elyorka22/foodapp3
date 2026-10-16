'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import {
  useAdminBusinessTypes,
  type BusinessTypeForm,
} from '@/hooks/use-admin-business-types';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveFormSlug } from '@/lib/slugify';

const emptyForm: BusinessTypeForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  menuMode: 'OWN_CATEGORIES',
  sortOrder: 0,
};

export function AdminBusinessTypesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'stores' });
  const { list, create, update, remove } = useAdminBusinessTypes();
  const [form, setForm] = useState<BusinessTypeForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!ready || !authorized) return null;

  const rows = list.data ?? [];

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Tur nomini kiriting');
      return;
    }
    const body: BusinessTypeForm = {
      ...form,
      slug: resolveFormSlug(form.name, editId ? form.slug : undefined),
      catalogMode: 'CATALOG',
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body });
        setEditId(null);
        toast.success('Saqlandi');
      } else {
        await create.mutateAsync(body);
        toast.success("Tur qo'shildi");
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
      description: row.description ?? '',
      icon: row.icon ?? '',
      menuMode: row.menuMode ?? 'OWN_CATEGORIES',
      sortOrder: row.sortOrder,
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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success("O'chirildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Biznes turlari</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Vertikallar (restoran, dorixona, …). Menyuni{' '}
          <strong>GLOBAL_DISH</strong> (umumiy taom kategoriyalari) yoki{' '}
          <strong>OWN_CATEGORIES</strong> (har bir biznes o‘z kategoriyalari) bilan
          belgilang — slug ga bog‘lanmaydi.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">
          {editId ? 'Turni tahrirlash' : 'Yangi tur'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Slug"
            value={form.slug ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <Input
            placeholder="Icon (emoji)"
            value={form.icon ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          />
          <label className="block text-xs font-medium opacity-70 sm:col-span-2">
            Menyusi
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={form.menuMode ?? 'OWN_CATEGORIES'}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  menuMode: e.target.value as 'GLOBAL_DISH' | 'OWN_CATEGORIES',
                }))
              }
            >
              <option value="OWN_CATEGORIES">OWN_CATEGORIES — o‘z kategoriyalari</option>
              <option value="GLOBAL_DISH">GLOBAL_DISH — umumiy taom kategoriyalari</option>
            </select>
          </label>
          <Input
            type="number"
            placeholder="Tartib"
            value={form.sortOrder ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
            }
          />
          <Input
            placeholder="Tavsif"
            value={form.description ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            {editId ? 'Saqlash' : "Qo'shish"}
          </Button>
          {editId ? (
            <Button
              variant="secondary"
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

      {rows.length === 0 ? (
        <EmptyState title="Turlar yo‘q" description="Yuqoridan yangi tur qo‘shing." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-zinc-500 dark:border-white/10">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Menyu</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 dark:border-white/10">
                  <td className="px-4 py-3 font-medium">
                    {row.icon ? `${row.icon} ` : ''}
                    {row.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.menuMode === 'GLOBAL_DISH' ? 'GLOBAL_DISH' : 'OWN_CATEGORIES'}
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={row.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
                        Tahrir
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleActive(row.id, row.isActive)}
                      >
                        {row.isActive ? 'Nofaol' : 'Faol'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteId(row.id)}
                      >
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
        title="Turni o‘chirish"
        description="Tur soft-delete qilinadi, slug bo‘shatiladi."
        confirmText="O‘chirish"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
