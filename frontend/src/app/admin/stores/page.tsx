'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/upload';
import { catalogModeLabel } from '@/lib/business-catalog-mode';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';
import { useAdminRestaurants, type RestaurantForm } from '@/hooks/use-admin-restaurants';
import { ActiveBadge } from '@/components/admin/active-badge';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Modal } from '@/components/admin/modal';
import { SearchInput } from '@/components/admin/filters';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoverPositionControls } from '@/components/admin/cover-position-controls';
import { BusinessImageUpload } from '@/components/admin/business-image-upload';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const emptyForm: RestaurantForm = {
  name: '',
  slug: '',
  businessTypeId: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  phone: '',
  commissionRate: 10,
  isActive: true,
  coverPositionX: 50,
  coverPositionY: 50,
};

export default function AdminStoresPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<RestaurantForm>(emptyForm);

  const typesQuery = useAdminBusinessTypes();
  const marketplaceTypes = useMemo(
    () => (typesQuery.list.data ?? []).filter((t) => t.slug !== 'restaurant' && t.isActive),
    [typesQuery.list.data],
  );

  const { list, create, update, remove, updateApproval } = useAdminRestaurants({
    page,
    limit: 50,
    search: search || undefined,
    vertical: 'store',
  });

  const rows = list.data?.data ?? [];

  const selectedType = marketplaceTypes.find((t) => t.id === form.businessTypeId);
  const isContactType = selectedType?.catalogMode === 'CONTACT';

  const uploadField = async (file: File, field: 'logoUrl' | 'coverUrl') => {
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const submitCreate = async () => {
    if (!form.name.trim() || !form.businessTypeId) {
      toast.error('Nom va kategoriya tanlang');
      return;
    }
    if (!form.logoUrl?.trim() || !form.coverUrl?.trim()) {
      toast.error('Logo va asosiy rasm yuklang');
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        slug: form.slug || slugify(form.name),
        phone: form.phone?.trim() || undefined,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success("Do'kon yaratildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  const submitEdit = async () => {
    if (!editRow?.id) return;
    if (!form.logoUrl?.trim() || !form.coverUrl?.trim()) {
      toast.error('Logo va asosiy rasm yuklang');
      return;
    }
    try {
      await update.mutateAsync({
        id: String(editRow.id),
        body: { ...form, phone: form.phone?.trim() || undefined },
      });
      setEditRow(null);
      setForm(emptyForm);
      toast.success('Saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditRow(row);
    setForm({
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      businessTypeId: (row.businessType as { id?: string })?.id ?? '',
      description: String(row.description ?? ''),
      logoUrl: String(row.logoUrl ?? ''),
      coverUrl: String(row.coverUrl ?? ''),
      phone: String(row.phone ?? ''),
      commissionRate: Number(row.commissionRate ?? 10),
      isActive: Boolean(row.isActive),
      coverPositionX: Number(row.coverPositionX ?? 50),
      coverPositionY: Number(row.coverPositionY ?? 50),
    });
  };

  if (list.isLoading) return <TableSkeleton rows={8} cols={6} />;

  const formFields = (
    <div className="space-y-3">
      <label className="block text-xs font-medium opacity-70">
        Kategoriya *
        <select
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={form.businessTypeId ?? ''}
          onChange={(e) => setForm({ ...form, businessTypeId: e.target.value })}
        >
          <option value="">Tanlang…</option>
          {marketplaceTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {catalogModeLabel(t.catalogMode)}
            </option>
          ))}
        </select>
      </label>
      {selectedType && (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-xs dark:bg-zinc-800">
          {isContactType
            ? 'Kontakt rejimi: mijozlar logotip va telefonni ko‘radi (menyu va savat yo‘q).'
            : 'Katalog rejimi: mahsulotlar va savat (restoran kabi).'}
        </p>
      )}
      <Input
        placeholder="Nom"
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
            slug: form.slug || slugify(e.target.value),
          })
        }
      />
      <Input
        placeholder="Slug"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />
      <Input
        placeholder="Telefon *"
        value={form.phone ?? ''}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <Input
        placeholder="Tavsif"
        value={form.description ?? ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <BusinessImageUpload
        label="Logo *"
        hint="Do'kon belgisi — kartochka va sahifada"
        imageUrl={form.logoUrl}
        onFile={(f) => uploadField(f, 'logoUrl')}
      />
      <BusinessImageUpload
        label="Asosiy rasm *"
        hint="Katta fon rasmi — ro'yxat va do'kon sahifasida"
        imageUrl={form.coverUrl}
        onFile={(f) => uploadField(f, 'coverUrl')}
      />
      {!isContactType && <CoverPositionControls form={form} setForm={setForm} />}
      <Input
        type="number"
        placeholder="Komissiya %"
        value={form.commissionRate ?? 10}
        onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive ?? true}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Faol
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Do&apos;konlar</h1>
          <p className="text-sm opacity-60">
            Marketplace do&apos;konlari — katalog (menyu) yoki kontakt (telefon)
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setForm({
              ...emptyForm,
              businessTypeId: marketplaceTypes[0]?.id ?? '',
            });
            setCreateOpen(true);
          }}
        >
          + Do&apos;kon qo&apos;shish
        </Button>
      </div>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Qidirish" />

      {!rows.length ? (
        <EmptyState title="Do'konlar yo'q" description="Birinchi do'konni yarating." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Kategoriya</th>
                <th className="px-4 py-3">Rejim</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: Record<string, unknown>) => {
                const bt = r.businessType as {
                  name?: string;
                  catalogMode?: string;
                } | null;
                return (
                  <tr key={String(r.id)} className="border-t dark:border-white/10">
                    <td className="px-4 py-3">
                      <p className="font-medium">{String(r.name)}</p>
                      <p className="text-xs opacity-50">{String(r.slug)}</p>
                    </td>
                    <td className="px-4 py-3">{bt?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">{catalogModeLabel(bt?.catalogMode)}</td>
                    <td className="px-4 py-3">{String(r.phone ?? '—')}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={Boolean(r.isActive)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {r.approvalStatus === 'PENDING' && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              updateApproval.mutateAsync({
                                id: String(r.id),
                                status: 'APPROVED',
                              })
                            }
                          >
                            Tasdiqlash
                          </Button>
                        )}
                        <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(r)}>
                          Tahrirlash
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => setDeleteId(String(r.id))}>
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

      <Modal open={createOpen} title="Do'kon qo'shish" onClose={() => setCreateOpen(false)}>
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
            Bekor
          </Button>
          <Button type="button" onClick={submitCreate}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <Modal open={!!editRow} title="Do'konni tahrirlash" onClose={() => setEditRow(null)}>
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>
            Bekor
          </Button>
          <Button type="button" onClick={submitEdit}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Do'konni o'chirish?"
        confirmText="O'chirish"
        danger
        onConfirm={async () => {
          if (!deleteId) return;
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
          toast.success('O\'chirildi');
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
