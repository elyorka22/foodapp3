'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useSharedCatalog } from '@/hooks/use-shared-catalog';
import { useAdminProductCategories } from '@/hooks/use-admin-product-categories';
import { uploadImage } from '@/lib/upload';
import { resolveFormSlug } from '@/lib/slugify';
import { resolveImageUrl } from '@/lib/image-url';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  typeSlug: string;
  pageTitle: string;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  productCategoryId: string;
  defaultPrice: number;
  isAvailable: boolean;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  productCategoryId: '',
  defaultPrice: 0,
  isAvailable: true,
};

export function SharedCatalogProductsPage({ typeSlug, pageTitle }: Props) {
  const { ready, authorized } = useAdminAccess({ permission: 'store.products' });
  const { list, create, update, remove, addImage } = useSharedCatalog(typeSlug);
  const { list: categories } = useAdminProductCategories({ typeSlug });
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!ready) return <LoadingState label="Yuklanmoqda..." />;
  if (!authorized) return null;

  const rows = list.data?.data ?? [];
  const categoryOptions = categories.data ?? [];

  const openCreate = () => {
    setForm(emptyForm);
    setImageFile(null);
    setCreateOpen(true);
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    setImageFile(null);
    setForm({
      name: row.name ?? '',
      slug: row.slug ?? '',
      description: row.description ?? '',
      productCategoryId: row.productCategoryId ?? '',
      defaultPrice: Number(row.defaultPrice ?? row.price ?? 0),
      isAvailable: row.isAvailable ?? true,
    });
  };

  const saveImage = async (productId: string) => {
    if (!imageFile) return;
    const { url } = await uploadImage(imageFile);
    await addImage.mutateAsync({ id: productId, url });
  };

  const submitCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Nom majburiy');
      return;
    }
    try {
      const created: any = await create.mutateAsync({
        name: form.name.trim(),
        slug: resolveFormSlug(form.name.trim()),
        description: form.description.trim() || undefined,
        productCategoryId: form.productCategoryId || undefined,
        defaultPrice: form.defaultPrice,
        price: form.defaultPrice,
        isAvailable: form.isAvailable,
      });
      if (imageFile && created?.id) await saveImage(created.id);
      toast.success("Katalog mahsuloti qo'shildi");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    try {
      await update.mutateAsync({
        id: editRow.id,
        body: {
          name: form.name.trim(),
          slug: resolveFormSlug(form.name.trim(), editRow.slug),
          description: form.description.trim() || undefined,
          productCategoryId: form.productCategoryId || undefined,
          defaultPrice: form.defaultPrice,
          price: form.defaultPrice,
          isAvailable: form.isAvailable,
        },
      });
      if (imageFile) await saveImage(editRow.id);
      toast.success('Saqlandi');
      setEditRow(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const formFields = (
    <div className="space-y-3">
      <Input
        placeholder="Mahsulot nomi"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <textarea
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        placeholder="Tavsif"
        rows={3}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
      />
      <select
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        value={form.productCategoryId}
        onChange={(e) => setForm((f) => ({ ...f, productCategoryId: e.target.value }))}
      >
        <option value="">Kategoriya (ixtiyoriy)</option>
        {categoryOptions.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Input
        type="number"
        min={0}
        placeholder="Standart narx (do'konga ko'chiriladi)"
        value={form.defaultPrice || ''}
        onChange={(e) =>
          setForm((f) => ({ ...f, defaultPrice: Number(e.target.value) || 0 }))
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isAvailable}
          onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
        />
        Faol
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <p className="text-sm opacity-60">
            Umumiy katalog — nom, rasm, tavsif. Narx do&apos;konda sozlanadi.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/stores/type/${encodeURIComponent(typeSlug)}/offers`}>
            <Button type="button" variant="secondary">
              Do&apos;kon takliflari
            </Button>
          </Link>
          <Button type="button" onClick={openCreate}>
            + Katalog mahsuloti
          </Button>
        </div>
      </div>

      {list.isLoading ? (
        <LoadingState label="Mahsulotlar..." />
      ) : !rows.length ? (
        <EmptyState
          title="Katalog bo'sh"
          description="Birinchi umumiy mahsulotni qo'shing, keyin do'konlarga ulang."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Rasm</th>
                <th className="px-4 py-3">Mahsulot</th>
                <th className="px-4 py-3">Kategoriya</th>
                <th className="px-4 py-3">Standart narx</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const img =
                  row.images?.find((i: any) => i.isPrimary) ?? row.images?.[0];
                const url = resolveImageUrl(img?.url);
                return (
                  <tr key={row.id} className="border-t dark:border-white/10">
                    <td className="px-4 py-3">
                      {url ? (
                        <img src={url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="text-xs opacity-40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs opacity-50">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3">{row.productCategory?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {Number(row.defaultPrice ?? row.price ?? 0).toLocaleString()} UZS
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={!!row.isAvailable} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => openEdit(row)}>
                          Tahrirlash
                        </Button>
                        <Button type="button" variant="danger" onClick={() => setDeleteId(row.id)}>
                          O&apos;chirish
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi katalog mahsuloti">
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
            Bekor
          </Button>
          <Button type="button" onClick={submitCreate} disabled={create.isPending}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Katalog mahsulotini tahrirlash">
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>
            Bekor
          </Button>
          <Button type="button" onClick={submitEdit} disabled={update.isPending}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Mahsulotni o'chirish?"
        description="Katalogdan olib tashlanadi. Do'kon takliflari ham yashirilishi mumkin."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await remove.mutateAsync(deleteId);
            toast.success("O'chirildi");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Xatolik');
          } finally {
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
