'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

const emptyBanner: BannerForm = {
  title: '',
  imageUrl: '',
  link: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminBannersPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { list, create, update, remove, reorder } = useAdminBanners();
  const [items, setItems] = useState<any[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyBanner);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  useEffect(() => {
    if (list.data) setItems(list.data);
  }, [list.data]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyBanner);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      link: b.linkUrl ?? '',
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setModalOpen(true);
  };

  const onUpload = async (file: File) => {
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const save = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: form });
        toast.success('Banner updated');
      } else {
        await create.mutateAsync(form);
        toast.success('Banner created');
      }
      setModalOpen(false);
      setForm(emptyBanner);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Banner deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const toggleActive = async (b: any) => {
    try {
      await update.mutateAsync({ id: b.id, body: { isActive: !b.isActive } });
      toast.success(b.isActive ? 'Banner deactivated' : 'Banner activated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
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
      toast.success('Order updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reorder');
      list.refetch();
    }
  };

  if (list.isLoading) return <TableSkeleton rows={4} cols={4} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load banners"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Banners</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Hide preview' : 'Preview'}
          </Button>
          <Button type="button" onClick={openCreate}>Add banner</Button>
        </div>
      </div>

      {preview && items.length > 0 && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">Homepage preview</p>
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
        <EmptyState title="No banners" description="Create a banner for the homepage carousel." />
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
                <p className="font-medium">{b.title}</p>
                <p className="truncate text-xs opacity-50">{b.linkUrl || 'No link'}</p>
              </div>
              <ActiveBadge active={b.isActive} />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => toggleActive(b)}>
                  {b.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => openEdit(b)}>Edit</Button>
                <Button type="button" variant="danger" onClick={() => setDeleteId(b.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editId ? 'Edit banner' : 'Add banner'} onClose={() => setModalOpen(false)}>
        <div className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Link URL" value={form.link ?? ''} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <label className="text-xs opacity-70">
            Image
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
            Active
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button type="button" onClick={save}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete banner?"
        danger
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
