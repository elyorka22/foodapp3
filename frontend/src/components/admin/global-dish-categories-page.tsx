'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminDishCategories, type DishCategoryForm } from '@/hooks/use-admin-dish-categories';
import { uploadImage } from '@/lib/upload';
import { ActiveBadge } from '@/components/admin/active-badge';
import { CategoryImagePositionControls } from '@/components/admin/category-image-position-controls';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveImageUrl } from '@/lib/image-url';
import { resolveFormSlug } from '@/lib/slugify';

const emptyForm: DishCategoryForm = {
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  imageScale: 100,
  imagePositionX: 50,
  imagePositionY: 50,
  sortOrder: 0,
  isActive: true,
};

export function GlobalDishCategoriesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'restaurant.categories' });
  const { list, create, update, remove } = useAdminDishCategories();
  const [form, setForm] = useState<DishCategoryForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!ready || !authorized) return null;

  const rows = list.data ?? [];

  const uploadCategoryImage = async (file: File) => {
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Rasm yuklandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Nom kiriting');
      return;
    }
    const base = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      imageUrl: form.imageUrl,
      imageScale: form.imageScale,
      imagePositionX: form.imagePositionX,
      imagePositionY: form.imagePositionY,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: base });
        setEditId(null);
        toast.success('Saqlandi');
      } else {
        await create.mutateAsync({
          ...base,
          slug: resolveFormSlug(form.name, undefined),
        });
        toast.success('Kategoriya yaratildi');
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
      imageUrl: row.imageUrl ?? '',
      imageScale: row.imageScale ?? 100,
      imagePositionX: row.imagePositionX ?? 50,
      imagePositionY: row.imagePositionY ?? 50,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await update.mutateAsync({ id, body: { isActive: !isActive } });
      toast.success(isActive ? 'O‘chirildi' : 'Faollashtirildi');
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
        <h1 className="text-xl font-bold">Taom kategoriyalari</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Umumiy ro‘yxat — barcha restoranlar shu kategoriyalardan foydalanadi. Restoranlar faqat
          mahsulot yaratishda tanlaydi.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{editId ? 'Tahrirlash' : 'Yangi kategoriya'}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Nom (masalan: Pizza)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Tartib raqami"
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadCategoryImage(f);
              }}
            />
            Rasm yuklash
          </label>
        </div>
        {form.imageUrl ? (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(form.imageUrl) ?? form.imageUrl}
              alt=""
              className="mb-2 h-24 w-32 rounded-lg object-cover"
            />
            <CategoryImagePositionControls form={form} setForm={setForm} />
          </div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Button type="button" onClick={submit} disabled={create.isPending || update.isPending}>
            {editId ? 'Saqlash' : 'Qo‘shish'}
          </Button>
          {editId ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              Bekor qilish
            </Button>
          ) : null}
        </div>
      </div>

      {list.isLoading ? (
        <p className="text-sm opacity-60">Yuklanmoqda…</p>
      ) : !rows.length ? (
        <EmptyState title="Kategoriyalar yo‘q" description="Birinchi taom kategoriyasini qo‘shing." />
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImageUrl(c.imageUrl) ?? c.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
                    —
                  </div>
                )}
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-zinc-500">
                    {c.slug} · {c._count?.products ?? 0} ta mahsulot
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ActiveBadge active={c.isActive} />
                <Button type="button" variant="secondary" onClick={() => startEdit(c)}>
                  Tahrirlash
                </Button>
                <Button type="button" variant="secondary" onClick={() => toggleActive(c.id, c.isActive)}>
                  {c.isActive ? 'O‘chirish' : 'Faollashtirish'}
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteId(c.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Kategoriyani o‘chirish?"
        description="Mahsulotlar kategoriyasiz qoladi."
        danger
        confirmText="O‘chirish"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
