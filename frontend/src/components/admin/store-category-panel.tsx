'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminProductCategories, type StoreCategoryForm } from '@/hooks/use-admin-product-categories';
import { BusinessImageUpload } from '@/components/admin/business-image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/admin/ui';
import { resolveImageUrl } from '@/lib/image-url';
import { slugify } from '@/lib/slugify';
import { uploadImage } from '@/lib/upload';

type Props = {
  businessId: string;
  businessName: string;
};

const emptyForm: StoreCategoryForm = {
  name: '',
  slug: '',
  imageUrl: '',
  sortOrder: 0,
};

export function StoreCategoryPanel({ businessId, businessName }: Props) {
  const { list, create, update, remove } = useAdminProductCategories(businessId);
  const [form, setForm] = useState<StoreCategoryForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const rows = list.data ?? [];

  const uploadCategoryImage = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Rasm yuklandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const onSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Nom kiriting');
      return;
    }
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      imageUrl: form.imageUrl?.trim() || undefined,
      sortOrder: form.sortOrder ?? 0,
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body });
        toast.success('Saqlandi');
      } else {
        await create.mutateAsync(body);
        toast.success('Kategoriya qo‘shildi');
      }
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  if (list.isLoading) {
    return <p className="text-sm opacity-60">Yuklanmoqda…</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <strong>{businessName}</strong> — mahsulot kategoriyalari faqat shu do‘kon uchun.
        Ichki sahifada doira sifatida chiqadi.
      </p>

      <div className="space-y-3 rounded-lg border border-dashed border-zinc-200 p-3 dark:border-white/10">
        <p className="text-sm font-semibold">{editId ? 'Tahrirlash' : 'Yangi kategoriya'}</p>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Kategoriya nomi"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="max-w-xs"
          />
          <Input
            placeholder="Tartib"
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            className="w-24"
          />
        </div>
        <BusinessImageUpload
          label="Kategoriya rasmi"
          hint="Do‘kon ichidagi kategoriya doiralari uchun"
          imageUrl={form.imageUrl}
          disabled={uploading}
          onFile={(file) => void uploadCategoryImage(file)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={create.isPending || update.isPending || uploading}
          >
            {editId ? 'Saqlash' : 'Qo‘shish'}
          </Button>
          {editId ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Bekor qilish
            </Button>
          ) : null}
          {form.imageUrl ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
            >
              Rasmni olib tashlash
            </Button>
          ) : null}
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="Kategoriyalar yo‘q" description="Birinchi kategoriyani yarating." />
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => {
            const src = c.imageUrl ? resolveImageUrl(c.imageUrl) ?? c.imageUrl : null;
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm dark:border-white/10"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-500">
                      {c.name.trim().charAt(0).toUpperCase() || '—'}
                    </div>
                  )}
                  <span className="truncate">
                    {c.name}
                    {c.isActive === false ? ' (o‘chirilgan)' : ''}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!px-2 !py-1 text-xs"
                    onClick={() => {
                      setEditId(c.id);
                      setForm({
                        name: c.name,
                        slug: c.slug,
                        imageUrl: c.imageUrl ?? '',
                        sortOrder: c.sortOrder ?? 0,
                      });
                    }}
                  >
                    Tahrirlash
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="!px-2 !py-1 text-xs"
                    onClick={async () => {
                      try {
                        await remove.mutateAsync(c.id);
                        if (editId === c.id) resetForm();
                        toast.success('O‘chirildi');
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Xatolik');
                      }
                    }}
                  >
                    O‘chirish
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
