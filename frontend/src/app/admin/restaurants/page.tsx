'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { uploadImage } from '@/lib/upload';
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
import { MerchantLocationFields } from '@/components/admin/merchant-location-fields';
import {
  MerchantOwnerAccountFields,
  MerchantOwnerCredentials,
} from '@/components/admin/merchant-owner-credentials';
import { adminI18n as t } from '@/lib/admin-i18n';
import { resolveFormSlug } from '@/lib/slugify';

const emptyForm: RestaurantForm = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  phone: '',
  commissionRate: 10,
  isActive: true,
  coverPositionX: 50,
  coverPositionY: 50,
  coverScale: 100,
  branchAddress: '',
  latitude: undefined,
  longitude: undefined,
};

function RestaurantFormFields({
  form,
  setForm,
  onLogo,
  onCover,
  showOwnerFields = false,
}: {
  form: RestaurantForm;
  setForm: (f: RestaurantForm) => void;
  onLogo: (file: File) => void;
  onCover: (file: File) => void;
  showOwnerFields?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Description"
        value={form.description ?? ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        placeholder="Phone"
        value={form.phone ?? ''}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Commission %"
        value={form.commissionRate ?? 10}
        onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs opacity-70">
          Logo
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-xs"
            onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])}
          />
        </label>
        <label className="text-xs opacity-70">
          Cover
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-xs"
            onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])}
          />
        </label>
      </div>
      {(form.logoUrl || form.coverUrl) && (
        <p className="text-xs opacity-60">Images attached. Save to apply.</p>
      )}
      <CoverPositionControls form={form} setForm={setForm} />
      <MerchantLocationFields form={form} setForm={setForm} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive ?? true}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Active (show on customer site when approved)
      </label>
      <p className="text-xs text-amber-700 dark:text-amber-400">
        New restaurants are published automatically if Active is checked. Existing pending
        restaurants need Approve in the list.
      </p>
      {showOwnerFields ? (
        <MerchantOwnerAccountFields
          form={form}
          setForm={(owner) => setForm({ ...form, ...owner })}
        />
      ) : null}
    </div>
  );
}

export default function AdminRestaurantsPage() {
  const token = getToken();
  const { ready, authorized, isSuperAdmin } = useAdminAccess({ permission: 'restaurants' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<RestaurantForm>(emptyForm);

  const isActiveFilter = status === '' ? undefined : status === 'active';

  const { list, create, update, remove, updateApproval } = useAdminRestaurants({
    page,
    limit: 20,
    search: search || undefined,
    isActive: isActiveFilter,
    vertical: 'restaurant',
  });

  const rows = list.data?.data ?? [];
  const totalPages = list.data?.meta?.totalPages ?? 1;

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
    try {
      const payload: RestaurantForm = {
        ...form,
        slug: resolveFormSlug(form.name),
      };
      if (isSuperAdmin && payload.ownerLogin?.trim() && !payload.ownerPassword?.trim()) {
        toast.error('Owner parolini kiriting');
        return;
      }
      if (isSuperAdmin && payload.ownerPassword?.trim() && !payload.ownerLogin?.trim()) {
        toast.error('Owner login (telefon yoki email) kiriting');
        return;
      }
      const created = await create.mutateAsync(payload);
      setCreateOpen(false);
      setForm(emptyForm);
      if (created?.approvalStatus === 'APPROVED' && created?.isActive) {
        toast.success('Restaurant created and visible on the homepage');
      } else {
        toast.success('Restaurant created — click Approve to show on the site');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    try {
      const body: Partial<RestaurantForm> = {
        ...form,
        slug: resolveFormSlug(form.name, editRow.slug),
      };
      if (!isSuperAdmin) {
        delete body.ownerLogin;
        delete body.ownerPassword;
        delete body.ownerFullName;
      } else if (!body.ownerPassword?.trim()) {
        delete body.ownerPassword;
      }
      await update.mutateAsync({
        id: editRow.id,
        body,
      });
      setEditRow(null);
      setForm(emptyForm);
      toast.success('Restaurant updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Restaurant deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await update.mutateAsync({ id: row.id, body: { isActive: !row.isActive } });
      toast.success(row.isActive ? 'Restaurant deactivated' : 'Restaurant activated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      logoUrl: row.logoUrl ?? '',
      coverUrl: row.coverUrl ?? '',
      phone: row.phone ?? '',
      commissionRate: Number(row.commissionRate ?? 10),
      isActive: row.isActive,
      coverPositionX: row.coverPositionX ?? 50,
      coverPositionY: row.coverPositionY ?? 50,
      coverScale: row.coverScale ?? 100,
      branchAddress: row.branchAddress ?? '',
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
      ownerLogin: row.ownerLogin ?? '',
      ownerFullName: row.ownerFullName ?? '',
      ownerPassword: '',
    });
  };

  if (!ready) return <TableSkeleton rows={8} cols={7} />;
  if (!authorized) return null;
  if (list.isLoading) return <TableSkeleton rows={8} cols={7} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load restaurants"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">{t.nav.restaurantList}</h1>
        <Button type="button" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
          {t.merchant.addRestaurant}
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name or slug" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No restaurants" description="Create your first restaurant." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Location</th>
                {isSuperAdmin ? <th className="px-4 py-3">{t.merchant.ownerLogin}</th> : null}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link href={`/admin/restaurants/${r.id}`} className="font-medium hover:underline">
                      {r.name}
                    </Link>
                    <p className="text-xs opacity-50">{r.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.approvalStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : r.approvalStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {r.approvalStatus ?? 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={r.isActive} />
                  </td>
                  <td className="px-4 py-3">{r.ordersCount ?? 0}</td>
                  <td className="px-4 py-3">{Number(r.revenue ?? 0).toLocaleString()} UZS</td>
                  <td className="px-4 py-3">{r.productsCount ?? 0}</td>
                  <td className="px-4 py-3">{Number(r.commissionRate ?? 0)}%</td>
                  <td className="px-4 py-3 text-xs opacity-70">
                    {r.latitude != null && r.longitude != null
                      ? `${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)}`
                      : '—'}
                  </td>
                  {isSuperAdmin ? (
                    <td className="px-4 py-3">
                      <MerchantOwnerCredentials
                        login={r.ownerLogin}
                        password={r.ownerPassword}
                        showPassword
                        compact
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => toggleActive(r)}>
                        {r.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {r.approvalStatus === 'PENDING' && (
                        <Button
                          type="button"
                          onClick={() => updateApproval.mutateAsync({ id: r.id, status: 'APPROVED' })}
                        >
                          Approve
                        </Button>
                      )}
                      <Button type="button" variant="secondary" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setDeleteId(r.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm opacity-70">
            Page {page} of {totalPages}
          </span>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal open={createOpen} title="Add restaurant" onClose={() => setCreateOpen(false)}>
        <RestaurantFormFields
          form={form}
          setForm={setForm}
          onLogo={(f) => uploadField(f, 'logoUrl')}
          onCover={(f) => uploadField(f, 'coverUrl')}
          showOwnerFields={isSuperAdmin}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submitCreate} disabled={create.isPending}>
            Create
          </Button>
        </div>
      </Modal>

      <Modal open={!!editRow} title="Edit restaurant" onClose={() => setEditRow(null)}>
        <RestaurantFormFields
          form={form}
          setForm={setForm}
          onLogo={(f) => uploadField(f, 'logoUrl')}
          onCover={(f) => uploadField(f, 'coverUrl')}
          showOwnerFields={isSuperAdmin}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>
            Cancel
          </Button>
          <Button type="button" onClick={submitEdit} disabled={update.isPending}>
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete restaurant?"
        description="This soft-deletes the restaurant and deactivates it."
        danger
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
