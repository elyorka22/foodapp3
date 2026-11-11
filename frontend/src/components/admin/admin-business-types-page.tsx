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

type CatalogKind = 'SHARED_CATALOG' | 'OWN_CATEGORIES' | 'GLOBAL_DISH';

const CATALOG_OPTIONS: Array<{
  value: CatalogKind;
  title: string;
  hint: string;
}> = [
  {
    value: 'SHARED_CATALOG',
    title: 'Umumiy katalog',
    hint: 'Bitta mahsulot ro‘yxati (nom/foto). Har do‘kon o‘z narxi va mavjudligini qo‘yadi. Masalan: oziq-ovqat, dorixona, parfyumeriya.',
  },
  {
    value: 'OWN_CATEGORIES',
    title: 'Individual katalog',
    hint: 'Har do‘kon o‘z mahsulotlarini yaratadi. Kategoriyalar tur bo‘yicha umumiy bo‘lishi mumkin. Masalan: gullar, sovg‘alar, zoomağaz.',
  },
  {
    value: 'GLOBAL_DISH',
    title: 'Restoran menyusi',
    hint: 'Umumiy taom kategoriyalari. Faqat restoranlar uchun.',
  },
];

function catalogLabel(mode?: string | null) {
  if (mode === 'SHARED_CATALOG') return 'Umumiy katalog';
  if (mode === 'GLOBAL_DISH') return 'Restoran menyusi';
  return 'Individual katalog';
}

const emptyForm: BusinessTypeForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  menuMode: undefined,
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
    if (!form.menuMode) {
      toast.error('Katalog turini tanlang (umumiy / individual / restoran)');
      return;
    }
    const body: BusinessTypeForm = {
      ...form,
      slug: resolveFormSlug(form.name, editId ? form.slug : undefined),
      catalogMode: 'CATALOG',
      menuMode: form.menuMode,
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
          Yangi tur (masalan zoomağaz) yaratganda <strong>katalog rejimini</strong> majburiy
          tanlang: umumiy katalog yoki individual menyu.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold">
          {editId ? 'Turni tahrirlash' : 'Yangi tur'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Nom *"
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
            className="sm:col-span-2"
          />
        </div>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-xs font-medium opacity-70">
            Katalog turi * (majburiy)
          </legend>
          <div className="grid gap-2 md:grid-cols-3">
            {CATALOG_OPTIONS.map((opt) => {
              const selected = form.menuMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, menuMode: opt.value }))}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                      : 'border-zinc-200 hover:border-zinc-400 dark:border-white/15'
                  }`}
                >
                  <p className="text-sm font-semibold">{opt.title}</p>
                  <p
                    className={`mt-1 text-xs leading-snug ${
                      selected ? 'opacity-80' : 'opacity-60'
                    }`}
                  >
                    {opt.hint}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

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
                <th className="px-4 py-3">Katalog</th>
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
                    {catalogLabel(row.menuMode)}
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
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}>
                        O&apos;chirish
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
        title="Turni o'chirish?"
        description="Bu tur yumshoq o'chiriladi."
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
