'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminCategories } from '@/hooks/use-admin-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/ui';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryPanel({ restaurantId }: { restaurantId: string }) {
  const { list, create, update, remove } = useAdminCategories(restaurantId);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await create.mutateAsync({
        restaurantId,
        name: name.trim(),
        slug: slugify(name),
      });
      setName('');
      toast.success('Category created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create category');
    }
  };

  const saveEdit = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await update.mutateAsync({
        id: editId,
        body: { name: editName.trim(), slug: slugify(editName) },
      });
      setEditId(null);
      toast.success('Category updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Category deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await update.mutateAsync({ id, body: { isActive: !isActive } });
      toast.success(isActive ? 'Category deactivated' : 'Category activated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  if (list.isLoading) {
    return <p className="text-sm opacity-60">Loading categories...</p>;
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm font-semibold">Categories</p>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" />
        <Button type="button" onClick={add} disabled={create.isPending}>
          Add
        </Button>
      </div>
      {!rows.length ? (
        <EmptyState title="No categories" description="Create a category for this restaurant." />
      ) : (
        <ul className="space-y-2">
          {rows.map((c: any) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm dark:border-white/10"
            >
              {editId === c.id ? (
                <div className="flex flex-1 gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Button type="button" onClick={saveEdit}>
                    Save
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setEditId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span>
                    {c.name}{' '}
                    <span className="opacity-50">({c._count?.products ?? 0} products)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <ActiveBadge active={c.isActive} />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditId(c.id);
                        setEditName(c.name);
                      }}
                    >
                      Edit
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => toggleActive(c.id, c.isActive)}>
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeleteId(c.id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete category?"
        description="Products in this category will remain but lose the category link if removed."
        danger
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
