'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { getToken } from '@/lib/auth';
import { Modal } from '@/components/admin/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/admin/ui';
import { uploadImage } from '@/lib/upload';
import { resolveImageUrl } from '@/lib/image-url';
import {
  useAdminBusinessTypes,
  type AdminBusinessType,
  type BusinessTypeForm,
} from '@/hooks/use-admin-business-types';

const empty: BusinessTypeForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  imageUrl: '',
  sortOrder: 0,
};

export default function AdminBusinessTypesPage() {
  const token = getToken();
  const { list, create, update, remove } = useAdminBusinessTypes();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BusinessTypeForm>(empty);
  const [uploading, setUploading] = useState(false);

  const rows = list.data ?? [];
  const loading = list.isLoading;

  const save = async () => {
    if (!token || !form.name.trim() || !form.slug.trim()) return;
    try {
      const body: BusinessTypeForm = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description || undefined,
        icon: form.icon || undefined,
        imageUrl: form.imageUrl || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, body });
      } else {
        await create.mutateAsync(body);
      }
      setOpen(false);
      setEditId(null);
      setForm(empty);
      toast.success('Saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const uploadCategoryImage = async (file: File) => {
    if (!token) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (row: AdminBusinessType) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      icon: row.icon ?? '',
      imageUrl: row.imageUrl ?? '',
      sortOrder: row.sortOrder,
    });
    setOpen(true);
  };

  const deactivate = async (id: string) => {
    if (!token || !confirm('Deactivate this category?')) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Deactivated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load categories"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Business categories</h1>
          <p className="text-sm opacity-60">Do&apos;konlar sahifasi kategoriyalari</p>
        </div>
        <Button type="button" onClick={() => { setEditId(null); setForm(empty); setOpen(true); }}>
          + Add category
        </Button>
      </div>

      {loading && <p className="text-sm opacity-60">Loading...</p>}
      {!loading && !rows.length && (
        <EmptyState title="No categories" description="Add marketplace categories." />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
          >
            {r.imageUrl ? (
              <div className="relative mb-2 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={resolveImageUrl(r.imageUrl) ?? r.imageUrl}
                  alt={r.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <p className="text-2xl">{r.icon}</p>
            )}
            <p className="mt-2 font-bold">{r.name}</p>
            <p className="text-xs opacity-60">{r.slug}</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(r)}>
                Edit
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => deactivate(r.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editId ? 'Edit category' : 'Add category'} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <div className="space-y-2">
            <label className="text-xs font-medium opacity-70">Category image</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCategoryImage(file);
              }}
              className="block w-full text-sm"
            />
            {form.imageUrl && (
              <p className="truncate text-xs opacity-60">{form.imageUrl}</p>
            )}
          </div>
          <Input
            type="number"
            placeholder="Sort order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
          <Button type="button" onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
