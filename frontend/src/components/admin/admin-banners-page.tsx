'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { uploadImage } from '@/lib/upload';
import { useAdminBanners, type BannerForm } from '@/hooks/use-admin-banners';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminI18n as t } from '@/lib/admin-i18n';
import { categoryImageStyle } from '@/lib/category-image-style';
import { ImageFramingControls } from '@/components/admin/image-framing-controls';

type BannerRow = {
  id: string;
  title?: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  placement?: 'HERO' | 'PROMO' | 'HOME_MAIN' | 'HOME_SIDE_TOP' | 'HOME_SIDE_BOTTOM';
  sortOrder?: number;
  isActive: boolean;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  businessId?: string | null;
  restaurantId?: string | null;
};

function merchantId(b: BannerRow) {
  return b.businessId ?? b.restaurantId ?? null;
}

const HOME_PLACEMENTS = ['HOME_MAIN', 'HOME_SIDE_TOP', 'HOME_SIDE_BOTTOM'] as const;
type HomePlacement = (typeof HOME_PLACEMENTS)[number];

function placementLabel(placement?: string) {
  if (placement === 'HOME_MAIN') return t.banners.placementHomeMain;
  if (placement === 'HOME_SIDE_TOP') return t.banners.placementHomeSideTop;
  if (placement === 'HOME_SIDE_BOTTOM') return t.banners.placementHomeSideBottom;
  if (placement === 'PROMO') return t.banners.placementPromo;
  return t.banners.placementHero;
}

const emptyBanner = (placement: BannerForm['placement']): BannerForm => ({
  title: '',
  description: '',
  imageUrl: '',
  link: '',
  placement,
  sortOrder: 0,
  isActive: true,
  imageScale: 100,
  imagePositionX: 50,
  imagePositionY: 50,
});

type Props = {
  title: string;
  hint?: string;
  vertical?: 'restaurant' | 'store';
  /** Homepage global banners only (no restaurant/store link) */
  homepageOnly?: boolean;
  /** Lock list and create form to one placement */
  placementMode?: 'HERO' | 'PROMO' | 'HOME_GRID';
};

export function AdminBannersPage({
  title,
  hint,
  vertical,
  homepageOnly = false,
  placementMode,
}: Props) {
  const token = getToken();
  const { ready, authorized } = useAdminAccess({ permission: 'banners' });
  const { list, create, update, remove, reorder } = useAdminBanners();
  const [merchantIds, setMerchantIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<BannerRow[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const defaultPlacement: BannerForm['placement'] =
    placementMode === 'HOME_GRID' ? 'HOME_MAIN' : placementMode ?? 'HERO';

  const [form, setForm] = useState<BannerForm>(() => emptyBanner(defaultPlacement));
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!token || !vertical) return;
    api<{ data: { id: string }[] }>(`/restaurants/admin?limit=200&vertical=${vertical}`, {
      token,
    })
      .then((res) => setMerchantIds(new Set(res.data.map((m) => m.id))))
      .catch(() => setMerchantIds(new Set()));
  }, [token, vertical]);

  const filtered = useMemo(() => {
    const raw = (list.data ?? []) as BannerRow[];
    return raw.filter((b) => {
      if (homepageOnly && merchantId(b)) return false;
      if (placementMode === 'PROMO' && homepageOnly) {
        return (b.placement ?? 'HERO') === 'PROMO' || (b.placement ?? 'HERO') === 'HERO';
      }
      if (placementMode === 'HOME_GRID') {
        return HOME_PLACEMENTS.includes((b.placement ?? 'HERO') as HomePlacement);
      }
      if (placementMode === 'HERO' || placementMode === 'PROMO') {
        if ((b.placement ?? 'HERO') !== placementMode) return false;
      }
      if (vertical) {
        const mid = merchantId(b);
        return mid != null && merchantIds.has(mid);
      }
      return true;
    });
  }, [list.data, vertical, merchantIds, homepageOnly, placementMode]);

  useEffect(() => {
    setItems(filtered);
  }, [filtered]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyBanner(defaultPlacement));
    setModalOpen(true);
  };

  const openEdit = (b: BannerRow) => {
    setEditId(b.id);
    setForm({
      title: b.title ?? '',
      description: b.description ?? '',
      imageUrl: b.imageUrl,
      link: b.linkUrl ?? '',
      placement:
        placementMode === 'HOME_GRID'
          ? ((b.placement as HomePlacement) ?? 'HOME_MAIN')
          : placementMode === 'HERO' || placementMode === 'PROMO'
            ? placementMode
            : (b.placement ?? 'HERO'),
      sortOrder: b.sortOrder,
      isActive: b.isActive,
      imageScale: b.imageScale ?? 100,
      imagePositionX: b.imagePositionX ?? 50,
      imagePositionY: b.imagePositionY ?? 50,
    });
    setModalOpen(true);
  };

  const onUpload = async (file: File) => {
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Rasm yuklandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Yuklashda xatolik');
    }
  };

  const save = async () => {
    if (!form.imageUrl?.trim()) {
      toast.error('Rasm yuklang');
      return;
    }
    const body: BannerForm = {
      ...form,
      placement:
        placementMode === 'HOME_GRID'
          ? form.placement ?? 'HOME_MAIN'
          : placementMode === 'HERO' || placementMode === 'PROMO'
            ? placementMode
            : form.placement ?? 'HERO',
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body });
        toast.success('Banner yangilandi');
      } else {
        await create.mutateAsync(body);
        toast.success('Banner yaratildi');
      }
      setModalOpen(false);
      setForm(emptyBanner(defaultPlacement));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Saqlashda xatolik');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success("O'chirildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chirishda xatolik");
    }
  };

  const fixPromoPlacement = async (b: BannerRow) => {
    try {
      await update.mutateAsync({ id: b.id, body: { placement: 'PROMO' } });
      toast.success('Joylashuv: Promo blok');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const toggleActive = async (b: BannerRow) => {
    try {
      await update.mutateAsync({ id: b.id, body: { isActive: !b.isActive } });
      toast.success(b.isActive ? 'Nofaol qilindi' : 'Faollashtirildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...items];
    const from = next.findIndex((b) => b.id === dragId);
    const to = next.findIndex((b) => b.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    try {
      await reorder.mutateAsync(next.map((b) => b.id));
      toast.success('Tartib yangilandi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
      list.refetch();
    }
  };

  if (!ready) return <TableSkeleton rows={4} cols={4} />;
  if (!authorized) return null;
  if (list.isLoading) return <TableSkeleton rows={4} cols={4} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Yuklashda xatolik"
        description={list.error instanceof Error ? list.error.message : ''}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {hint && <p className="mt-1 max-w-xl text-sm text-zinc-500">{hint}</p>}
          {vertical && (
            <p className="mt-1 text-sm text-zinc-500">
              {vertical === 'restaurant'
                ? t.merchant.restaurantsOnly
                : t.merchant.storesOnly}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Yashirish' : "Ko'rish"}
          </Button>
          <Button type="button" onClick={openCreate}>
            Banner qo&apos;shish
          </Button>
        </div>
      </div>

      {preview && items.length > 0 && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">Oldindan ko&apos;rish</p>
          <div className="flex gap-3 overflow-x-auto">
            {items.filter((b) => b.isActive).map((b) => (
              <div key={b.id} className="min-w-[200px] shrink-0">
                <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-full w-full"
                    style={categoryImageStyle({
                      imageScale: b.imageScale ?? 100,
                      imagePositionX: b.imagePositionX ?? 50,
                      imagePositionY: b.imagePositionY ?? 50,
                    })}
                  />
                </div>
                <p className="mt-1 text-xs font-medium">{b.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!items.length ? (
        <EmptyState
          title="Bannerlar yo&apos;q"
          description={
            placementMode === 'PROMO'
              ? 'Promo blok uchun banner yarating (karusel ostidagi blok).'
              : 'Yangi banner yarating.'
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((b) => {
            const wrongPlacement =
              placementMode === 'PROMO' && (b.placement ?? 'HERO') !== 'PROMO';
            return (
            <div
              key={b.id}
              draggable
              onDragStart={() => setDragId(b.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(b.id)}
              className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
            >
              <span className="cursor-grab text-xs opacity-40">⋮⋮</span>
              <img src={b.imageUrl} alt="" className="h-16 w-28 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{b.title || '(faqat rasm)'}</p>
                {b.description && (
                  <p className="text-xs text-zinc-500">{b.description}</p>
                )}
                {wrongPlacement && (
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    Karuselda ko&apos;rinadi — promo blok uchun joylashuvni o&apos;zgartiring
                  </p>
                )}
                <p className="truncate text-xs opacity-50">
                  {placementLabel(b.placement)}
                  {b.linkUrl ? ` · ${b.linkUrl}` : ''}
                </p>
              </div>
              <ActiveBadge active={b.isActive} />
              <div className="flex flex-wrap justify-end gap-2">
                {wrongPlacement && (
                  <Button type="button" onClick={() => fixPromoPlacement(b)}>
                    Promo blokka
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={() => toggleActive(b)}>
                  {b.isActive ? t.inactive : t.active}
                </Button>
                <Button type="button" variant="secondary" onClick={() => openEdit(b)}>
                  {t.edit}
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteId(b.id)}>
                  {t.delete}
                </Button>
              </div>
            </div>
          );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editId ? 'Bannerni tahrirlash' : 'Banner qo&apos;shish'}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-3">
          {(!placementMode || placementMode === 'HOME_GRID') && (
            <label className="block text-xs font-medium opacity-70">
              Joylashuv
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
                value={form.placement ?? defaultPlacement}
                onChange={(e) =>
                  setForm({
                    ...form,
                    placement: e.target.value as BannerForm['placement'],
                  })
                }
              >
                {placementMode === 'HOME_GRID' ? (
                  <>
                    <option value="HOME_MAIN">{t.banners.placementHomeMain}</option>
                    <option value="HOME_SIDE_TOP">{t.banners.placementHomeSideTop}</option>
                    <option value="HOME_SIDE_BOTTOM">{t.banners.placementHomeSideBottom}</option>
                  </>
                ) : (
                  <>
                    <option value="HERO">{t.banners.placementHero}</option>
                    <option value="PROMO">{t.banners.placementPromo}</option>
                  </>
                )}
              </select>
            </label>
          )}
          {placementMode === 'PROMO' && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Bu banner bosh sahifada asosiy karusel ostida ko&apos;rinadi.
            </p>
          )}
          <Input
            placeholder="Sarlavha (masalan: Bepul yetkazish)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Tavsif (promo blok ostida)"
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Havola"
            value={form.link ?? ''}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <label className="text-xs opacity-70">
            Rasm *
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
          {form.imageUrl && (
            <ImageFramingControls
              label="Banner rasm — joylashuv va masshtab"
              imageUrl={form.imageUrl}
              previewAspectClass={
                form.placement === 'HOME_MAIN' ? 'aspect-[5/6] max-h-[200px]' : 'aspect-[2/1]'
              }
              values={{
                imageScale: form.imageScale ?? 100,
                imagePositionX: form.imagePositionX ?? 50,
                imagePositionY: form.imagePositionY ?? 50,
              }}
              onChange={(v) =>
                setForm({
                  ...form,
                  imageScale: v.imageScale ?? 100,
                  imagePositionX: v.imagePositionX ?? 50,
                  imagePositionY: v.imagePositionY ?? 50,
                })
              }
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            {t.active}
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
            {t.cancel}
          </Button>
          <Button type="button" onClick={save}>
            {t.save}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t.confirmDelete}
        danger
        confirmText={t.delete}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
