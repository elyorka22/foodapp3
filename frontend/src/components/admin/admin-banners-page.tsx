'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';
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

const emptyBanner: BannerForm = {
  title: '',
  description: '',
  imageUrl: '',
  link: '',
  placement: 'HERO',
  sortOrder: 0,
  isActive: true,
};

type Props = {
  title: string;
  vertical?: 'restaurant' | 'store';
};

export function AdminBannersPage({ title, vertical }: Props) {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { list, create, update, remove, reorder } = useAdminBanners();
  const [merchantIds, setMerchantIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<any[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyBanner);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/staff/login');
  }, [token, user, router]);

  useEffect(() => {
    if (!token || !vertical) return;
    api<{ data: { id: string }[] }>(`/restaurants/admin?limit=200&vertical=${vertical}`, {
      token,
    })
      .then((res) => setMerchantIds(new Set(res.data.map((m) => m.id))))
      .catch(() => setMerchantIds(new Set()));
  }, [token, vertical]);

  const filtered = useMemo(() => {
    const raw = list.data ?? [];
    if (!vertical) return raw;
    return raw.filter(
      (b: { businessId?: string | null; restaurantId?: string | null }) => {
        const bid = b.businessId ?? b.restaurantId;
        return bid != null && merchantIds.has(bid);
      },
    );
  }, [list.data, vertical, merchantIds]);

  useEffect(() => {
    setItems(filtered);
  }, [filtered]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyBanner);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      title: b.title ?? '',
      description: b.description ?? '',
      imageUrl: b.imageUrl,
      link: b.linkUrl ?? '',
      placement: b.placement ?? 'HERO',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
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
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: form });
        toast.success('Banner yangilandi');
      } else {
        await create.mutateAsync(form);
        toast.success('Banner yaratildi');
      }
      setModalOpen(false);
      setForm(emptyBanner);
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

  const toggleActive = async (b: any) => {
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
          {vertical && (
            <p className="text-sm text-zinc-500">
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
                <img src={b.imageUrl} alt={b.title} className="h-24 w-full rounded-lg object-cover" />
                <p className="mt-1 text-xs font-medium">{b.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!items.length ? (
        <EmptyState title="Bannerlar yo&apos;q" description="Yangi banner yarating." />
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
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
                <p className="truncate text-xs opacity-50">
                  {b.placement ?? 'HERO'}
                  {b.linkUrl ? ` · ${b.linkUrl}` : ''}
                </p>
              </div>
              <ActiveBadge active={b.isActive} />
              <div className="flex gap-2">
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
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editId ? 'Bannerni tahrirlash' : 'Banner qo&apos;shish'}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium opacity-70">
            Joylashuv
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={form.placement ?? 'HERO'}
              onChange={(e) =>
                setForm({ ...form, placement: e.target.value as 'HERO' | 'PROMO' })
              }
            >
              <option value="HERO">Hero (bosh sahifa)</option>
              <option value="PROMO">Promo blok</option>
            </select>
          </label>
          <Input
            placeholder="Sarlavha"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Tavsif"
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Havola"
            value={form.link ?? ''}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <label className="text-xs opacity-70">
            Rasm
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview" className="h-24 w-full rounded-lg object-cover" />
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
