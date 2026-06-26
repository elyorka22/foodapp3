'use client';

import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminPromoCodes, type PromoCode, type PromoCodeForm } from '@/hooks/use-admin-promo-codes';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const p = t.promoCodes;

const emptyForm: PromoCodeForm = {
  code: '',
  type: 'PERCENTAGE',
  value: 10,
  isActive: true,
};

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {hint ? <p className="mb-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {children}
    </label>
  );
}

const selectClassName =
  'w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900';

export default function AdminPromoCodesPage() {
  const { ready, authorized } = useAdminAccess({ permission: 'promotions' });
  const { list, create, update, remove } = useAdminPromoCodes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoCodeForm>(emptyForm);

  const isPercentage = form.type === 'PERCENTAGE';

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (promo: PromoCode) => {
    setEditId(promo.id);
    setForm({
      code: promo.code,
      type: promo.type,
      value: Number(promo.value),
      minimumOrderAmount: promo.minimumOrderAmount ? Number(promo.minimumOrderAmount) : undefined,
      maximumDiscount: promo.maximumDiscount ? Number(promo.maximumDiscount) : undefined,
      usageLimit: promo.usageLimit ?? undefined,
      startsAt: promo.startsAt ? promo.startsAt.slice(0, 10) : undefined,
      expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : undefined,
      isActive: promo.isActive,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, body: form });
        toast.success(p.updated);
      } else {
        await create.mutateAsync(form);
        toast.success(p.created);
      }
      setModalOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : p.saveFailed);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success(p.deactivated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : p.deleteFailed);
    }
  };

  if (!ready) return <TableSkeleton cols={6} rows={5} />;
  if (!authorized) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{p.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{p.subtitle}</p>
        </div>
        <Button onClick={openCreate}>{p.newPromo}</Button>
      </div>

      {list.isLoading ? (
        <TableSkeleton cols={6} rows={5} />
      ) : !list.data?.length ? (
        <EmptyState title={p.emptyTitle} description={p.emptyDescription} />
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs dark:bg-zinc-800">
              <tr>
                <th className="p-3">{p.tableCode}</th>
                <th className="p-3">{p.tableType}</th>
                <th className="p-3">{p.tableValue}</th>
                <th className="p-3">{p.tableUsage}</th>
                <th className="p-3">{p.tableStatus}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.data.map((promo) => (
                <tr key={promo.id} className="border-t dark:border-white/10">
                  <td className="p-3 font-mono font-semibold">{promo.code}</td>
                  <td className="p-3">
                    {promo.type === 'PERCENTAGE' ? p.typeShortPercentage : p.typeShortFixed}
                  </td>
                  <td className="p-3">
                    {promo.type === 'PERCENTAGE'
                      ? `${Number(promo.value)}%`
                      : `${Number(promo.value).toLocaleString()} so‘m`}
                  </td>
                  <td className="p-3">
                    {promo.usageCount}
                    {promo.usageLimit != null ? ` / ${promo.usageLimit}` : ` (${p.usageUnlimited})`}
                  </td>
                  <td className="p-3">
                    <ActiveBadge
                      active={promo.isActive ?? true}
                      label={promo.isActive ?? true ? t.active : t.inactive}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="mr-2 text-brand-600"
                      onClick={() => openEdit(promo)}
                    >
                      {t.edit}
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => setDeleteId(promo.id)}
                    >
                      {p.deactivate}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? p.editPromo : p.newPromo}
      >
        <div className="space-y-4">
          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
            {p.formIntro}
          </p>

          <FormField label={p.codeLabel} hint={p.codeHint}>
            <Input
              placeholder={p.codePlaceholder}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
          </FormField>

          <FormField label={p.typeLabel} hint={p.typeHint}>
            <select
              className={selectClassName}
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as PromoCodeForm['type'] }))
              }
            >
              <option value="PERCENTAGE">{p.typePercentage}</option>
              <option value="FIXED">{p.typeFixed}</option>
            </select>
          </FormField>

          <FormField
            label={p.valueLabel}
            hint={isPercentage ? p.valueHintPercentage : p.valueHintFixed}
          >
            <Input
              type="number"
              min={0}
              max={isPercentage ? 100 : undefined}
              placeholder={
                isPercentage ? p.valuePlaceholderPercentage : p.valuePlaceholderFixed
              }
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
            />
          </FormField>

          <div className="border-t pt-3 dark:border-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {p.optionalSection}
            </p>
            <div className="space-y-3">
              <FormField label={p.minOrderLabel} hint={p.minOrderHint}>
                <Input
                  type="number"
                  min={0}
                  placeholder={p.minOrderPlaceholder}
                  value={form.minimumOrderAmount ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </FormField>

              {isPercentage ? (
                <FormField label={p.maxDiscountLabel} hint={p.maxDiscountHint}>
                  <Input
                    type="number"
                    min={0}
                    placeholder={p.maxDiscountPlaceholder}
                    value={form.maximumDiscount ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maximumDiscount: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </FormField>
              ) : null}

              <FormField label={p.usageLimitLabel} hint={p.usageLimitHint}>
                <Input
                  type="number"
                  min={1}
                  placeholder={p.usageLimitPlaceholder}
                  value={form.usageLimit ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimit: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </FormField>

              <FormField label={p.startsAtLabel} hint={p.startsAtHint}>
                <Input
                  type="date"
                  value={form.startsAt ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startsAt: e.target.value || undefined }))
                  }
                />
              </FormField>

              <FormField label={p.expiresAtLabel} hint={p.expiresAtHint}>
                <Input
                  type="date"
                  value={form.expiresAt ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value || undefined }))
                  }
                />
              </FormField>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <span>
              <span className="block font-medium">{p.isActiveLabel}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{p.isActiveHint}</span>
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            <Button onClick={save} disabled={create.isPending || update.isPending}>
              {t.save}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t.cancel}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={p.deactivateConfirmTitle}
        description={p.deactivateConfirmDescription}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
