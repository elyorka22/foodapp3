'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminPromoCodes, type PromoCodeForm } from '@/hooks/use-admin-promo-codes';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emptyForm: PromoCodeForm = {
  code: '',
  type: 'PERCENTAGE',
  value: 10,
  isActive: true,
};

export default function AdminPromoCodesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'promotions' });
  const { list, create, update, remove } = useAdminPromoCodes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoCodeForm>(emptyForm);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      code: p.code,
      type: p.type,
      value: Number(p.value),
      minimumOrderAmount: p.minimumOrderAmount ? Number(p.minimumOrderAmount) : undefined,
      maximumDiscount: p.maximumDiscount ? Number(p.maximumDiscount) : undefined,
      usageLimit: p.usageLimit ?? undefined,
      startsAt: p.startsAt ? p.startsAt.slice(0, 10) : undefined,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : undefined,
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: form });
        toast.success('Promo code updated');
      } else {
        await create.mutateAsync(form);
        toast.success('Promo code created');
      }
      setModalOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Promo code deactivated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  if (!ready) return <TableSkeleton cols={6} rows={5} />;
  if (!authorized) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.nav.promotions}</h1>
        <Button onClick={openCreate}>{t.create}</Button>
      </div>

      {list.isLoading ? (
        <TableSkeleton cols={6} rows={5} />
      ) : !list.data?.length ? (
        <EmptyState title="No promo codes" description="Create your first promo code." />
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs dark:bg-zinc-800">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.data.map((p) => (
                <tr key={p.id} className="border-t dark:border-white/10">
                  <td className="p-3 font-mono font-semibold">{p.code}</td>
                  <td className="p-3">{p.type}</td>
                  <td className="p-3">
                    {p.type === 'PERCENTAGE' ? `${Number(p.value)}%` : `${Number(p.value).toLocaleString()} UZS`}
                  </td>
                  <td className="p-3">
                    {p.usageCount}
                    {p.usageLimit != null ? ` / ${p.usageLimit}` : ''}
                  </td>
                  <td className="p-3">
                    <ActiveBadge active={p.isActive ?? true} />
                  </td>
                  <td className="p-3 text-right">
                    <button type="button" className="mr-2 text-brand-600" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600" onClick={() => setDeleteId(p.id)}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit promo' : 'New promo'}>
        <div className="space-y-3">
          <Input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          <select
            className="w-full rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PromoCodeForm['type'] }))}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
          <Input
            type="number"
            placeholder="Value"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Min order (optional)"
            value={form.minimumOrderAmount ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Max discount (optional)"
            value={form.maximumDiscount ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maximumDiscount: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Usage limit (optional)"
            value={form.usageLimit ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : undefined }))
            }
          />
          <Input
            type="date"
            value={form.startsAt ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value || undefined }))}
          />
          <Input
            type="date"
            value={form.expiresAt ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || undefined }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <Button onClick={save} disabled={create.isPending || update.isPending}>
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Deactivate promo code?"
        description="The code will no longer be usable at checkout."
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
