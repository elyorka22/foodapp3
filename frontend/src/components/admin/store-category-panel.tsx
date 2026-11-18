'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminProductCategories, type StoreCategoryForm } from '@/hooks/use-admin-product-categories';
import {
  useAdminBusinessTypes,
  type AdminBusinessType,
} from '@/hooks/use-admin-business-types';
import { BusinessImageUpload } from '@/components/admin/business-image-upload';
import { ImageFramingControls } from '@/components/admin/image-framing-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/admin/ui';
import { categoryImagePanStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { slugify } from '@/lib/slugify';
import { uploadImage } from '@/lib/upload';

type Props = {
  typeSlug: string;
  typeName: string;
  businessType?: AdminBusinessType | null;
};

type AllTileForm = {
  imageUrl: string;
  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;
};

const emptyForm: StoreCategoryForm = {
  name: '',
  slug: '',
  imageUrl: '',
  imageScale: 100,
  imagePositionX: 50,
  imagePositionY: 50,
  sortOrder: 0,
};

function allTileFromType(type?: AdminBusinessType | null): AllTileForm {
  return {
    imageUrl: type?.allCategoriesImageUrl ?? '',
    imageScale: type?.allCategoriesImageScale ?? 100,
    imagePositionX: type?.allCategoriesImagePositionX ?? 50,
    imagePositionY: type?.allCategoriesImagePositionY ?? 50,
  };
}

export function StoreCategoryPanel({ typeSlug, typeName, businessType }: Props) {
  const { list, create, update, remove } = useAdminProductCategories({ typeSlug });
  const businessTypes = useAdminBusinessTypes();
  const [form, setForm] = useState<StoreCategoryForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [allTile, setAllTile] = useState<AllTileForm>(() => allTileFromType(businessType));
  const [allTileUploading, setAllTileUploading] = useState(false);
  const [allTileSaving, setAllTileSaving] = useState(false);

  const rows = list.data ?? [];
  const typeId = businessType?.id;

  useEffect(() => {
    setAllTile(allTileFromType(businessType));
  }, [businessType]);

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

  const uploadAllTileImage = async (file: File) => {
    setAllTileUploading(true);
    try {
      const { url } = await uploadImage(file);
      setAllTile((f) => ({ ...f, imageUrl: url }));
      toast.success('Rasm yuklandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setAllTileUploading(false);
    }
  };

  const saveAllTile = async () => {
    if (!typeId) {
      toast.error('Biznes turi topilmadi');
      return;
    }
    setAllTileSaving(true);
    try {
      await businessTypes.update.mutateAsync({
        id: typeId,
        body: {
          allCategoriesImageUrl: allTile.imageUrl.trim() || '',
          allCategoriesImageScale: allTile.imageScale,
          allCategoriesImagePositionX: allTile.imagePositionX,
          allCategoriesImagePositionY: allTile.imagePositionY,
        },
      });
      toast.success('«Barcha kategoriyalar» rasmi saqlandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    } finally {
      setAllTileSaving(false);
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
      imageScale: form.imageScale ?? 100,
      imagePositionX: form.imagePositionX ?? 50,
      imagePositionY: form.imagePositionY ?? 50,
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
        <strong>{typeName}</strong> — umumiy mahsulot kategoriyalari. Shu turdagi barcha
        do‘konlar bir xil ro‘yxatdan foydalanadi. Faqat admin tahrirlaydi.
      </p>

      {typeId ? (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-white/10 dark:bg-zinc-900/40">
          <div>
            <p className="text-sm font-semibold">«Barcha kategoriyalar» rasmi</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Do‘kon menyusidagi «Barcha kategoriyalar» plitkasi uchun.
            </p>
          </div>
          <BusinessImageUpload
            label="Plitka rasmi"
            hint="Kvadrat kategoriya plitkasi"
            imageUrl={allTile.imageUrl}
            disabled={allTileUploading || allTileSaving}
            onFile={(file) => void uploadAllTileImage(file)}
          />
          {allTile.imageUrl ? (
            <ImageFramingControls
              label="Joylashuv (zoom / position)"
              imageUrl={allTile.imageUrl}
              values={{
                imageScale: allTile.imageScale,
                imagePositionX: allTile.imagePositionX,
                imagePositionY: allTile.imagePositionY,
              }}
              onChange={(next) =>
                setAllTile((f) => ({
                  ...f,
                  imageScale: next.imageScale ?? 100,
                  imagePositionX: next.imagePositionX ?? 50,
                  imagePositionY: next.imagePositionY ?? 50,
                }))
              }
              previewAspectClass="aspect-[1/1.05]"
              previewMaxWidthClass="max-w-[140px]"
              previewRoundedClass="rounded-[20px]"
            />
          ) : null}
          <Button
            type="button"
            onClick={() => void saveAllTile()}
            disabled={allTileUploading || allTileSaving || businessTypes.update.isPending}
          >
            {allTileSaving ? 'Saqlanmoqda…' : 'Plitka rasmini saqlash'}
          </Button>
        </div>
      ) : null}

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
        {form.imageUrl ? (
          <ImageFramingControls
            label="Doira ichida joylashuv (zoom / position)"
            imageUrl={form.imageUrl}
            values={{
              imageScale: form.imageScale ?? 100,
              imagePositionX: form.imagePositionX ?? 50,
              imagePositionY: form.imagePositionY ?? 50,
            }}
            onChange={(next) =>
              setForm((f) => ({
                ...f,
                imageScale: next.imageScale ?? 100,
                imagePositionX: next.imagePositionX ?? 50,
                imagePositionY: next.imagePositionY ?? 50,
              }))
            }
            previewAspectClass="aspect-square"
            previewMaxWidthClass="max-w-[160px]"
            previewRoundedClass="rounded-full"
          />
        ) : null}
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
              Bekor
            </Button>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Kategoriya yo‘q"
          description="Yuqoridan umumiy kategoriya qo‘shing — barcha do‘konlar ko‘radi."
        />
      ) : (
        <ul className="divide-y rounded-lg border dark:divide-white/10 dark:border-white/10">
          {rows.map((c) => {
            const thumbSrc = c.imageUrl
              ? resolveImageUrl(c.imageUrl) ?? c.imageUrl
              : null;
            const pan = categoryImagePanStyle({
              imageScale: c.imageScale,
              imagePositionX: c.imagePositionX,
              imagePositionY: c.imagePositionY,
            });
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-3 px-3 py-2.5"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {thumbSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbSrc} alt="" style={pan} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-400">
                      {c.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-zinc-500">{c.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditId(c.id);
                      setForm({
                        name: c.name,
                        slug: c.slug,
                        imageUrl: c.imageUrl ?? '',
                        imageScale: c.imageScale ?? 100,
                        imagePositionX: c.imagePositionX ?? 50,
                        imagePositionY: c.imagePositionY ?? 50,
                        sortOrder: c.sortOrder ?? 0,
                      });
                    }}
                  >
                    Tahrir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (!confirm('O‘chirishni tasdiqlaysizmi?')) return;
                      void remove.mutateAsync(c.id).then(
                        () => toast.success('O‘chirildi'),
                        (e) =>
                          toast.error(e instanceof Error ? e.message : 'Xatolik'),
                      );
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
