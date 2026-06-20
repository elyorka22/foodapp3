'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getToken, getUser } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { api } from '@/lib/api';
import {
  useAdminUsers,
  type CreateStaffUserForm,
  type StaffRole,
  type StaffUser,
  type UpdateStaffUserForm,
} from '@/hooks/use-admin-users';
import { Modal } from '@/components/admin/modal';
import { ActiveBadge } from '@/components/admin/active-badge';
import { EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { adminI18n as t } from '@/lib/admin-i18n';

const ALL_ROLES: { value: StaffRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: t.staff.roleSuperAdmin },
  { value: 'MANAGER', label: t.staff.roleManager },
  { value: 'BUSINESS', label: t.staff.roleBusiness },
  { value: 'COURIER', label: t.staff.roleCourier },
];

const BUSINESS_ROLES: StaffRole[] = ['BUSINESS'];

const emptyForm: CreateStaffUserForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'MANAGER',
  restaurantId: '',
};

const ROLE_LABEL: Record<StaffRole, string> = Object.fromEntries(
  ALL_ROLES.map((r) => [r.value, r.label]),
) as Record<StaffRole, string>;

function merchantName(row: StaffUser) {
  return row.restaurant?.name ?? row.business?.name ?? '—';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const currentUser = getUser();
  const token = getToken();
  const { ready, authorized, isSuperAdmin, isManager } = useAdminAccess({ permission: 'staff' });
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<StaffUser | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);

  const { list, create, update } = useAdminUsers(roleFilter || undefined);

  useEffect(() => {
    if (!token) return;
    api<{ data: { id: string; name: string }[] }>('/restaurants/admin?limit=100', { token })
      .then((res) => setRestaurants(res.data ?? []))
      .catch(() => undefined);
  }, [token]);

  const creatableRoles = isManager
    ? ALL_ROLES.filter((r) => r.value !== 'SUPER_ADMIN')
    : ALL_ROLES;
  const rows = (list.data ?? []).filter((r) => !isManager || r.role !== 'SUPER_ADMIN');
  const needsBusiness = BUSINESS_ROLES.includes(form.role);

  const submitCreate = async () => {
    if (!form.email.trim() || !form.password || form.password.length < 6) {
      toast.error('Email va parol (kamida 6 belgi) kerak');
      return;
    }
    if (needsBusiness && !form.restaurantId) {
      toast.error('Restoran tanlang');
      return;
    }
    try {
      await create.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone?.trim() || undefined,
        role: form.role,
        restaurantId: needsBusiness ? form.restaurantId : undefined,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success(`${t.staff.userCreated}. ${t.staff.password}: ${form.password}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const toggleActive = async (row: StaffUser) => {
    if (row.id === currentUser?.id && row.isActive) {
      toast.error(t.staff.cannotBlockSelf);
      return;
    }
    try {
      await update.mutateAsync({
        id: row.id,
        body: { isActive: !row.isActive },
      });
      toast.success(t.staff.userUpdated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    const body: UpdateStaffUserForm = {};
    if (editPassword.trim().length >= 6) body.password = editPassword.trim();
    try {
      await update.mutateAsync({ id: editRow.id, body });
      setEditRow(null);
      setEditPassword('');
      toast.success(
        editPassword.trim()
          ? `${t.staff.userUpdated}. ${t.staff.password}: ${editPassword.trim()}`
          : t.staff.userUpdated,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  const copyPassword = async (value: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Parol nusxalandi');
    } catch {
      toast.error('Nusxalash mumkin emas');
    }
  };

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;
  if (list.isLoading) return <LoadingState label={t.loading} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t.staff.title}</h1>
          <p className="text-sm text-zinc-500">{t.staff.subtitle}</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          + {t.create}
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <label className="text-xs text-zinc-500">{t.staff.filterRole}</label>
        <select
          className="mt-1 w-full max-w-xs rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as StaffRole | '')}
        >
          <option value="">{t.staff.allRoles}</option>
          {creatableRoles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {!rows.length ? (
        <EmptyState title={t.noData} description={t.create} />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs text-zinc-600 dark:bg-zinc-800">
              <tr>
                <th className="p-3">{t.staff.fullName}</th>
                <th className="p-3">Email</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Rol</th>
                <th className="p-3">{t.staff.merchant}</th>
                {isSuperAdmin ? <th className="p-3">{t.staff.password}</th> : null}
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelf = row.id === currentUser?.id;
                return (
                  <tr key={row.id} className="border-t dark:border-white/10">
                    <td className="p-3 font-medium">{row.fullName ?? '—'}</td>
                    <td className="p-3">{row.email ?? '—'}</td>
                    <td className="p-3">{row.phone ?? '—'}</td>
                    <td className="p-3">
                      <span className="rounded bg-brand-100 px-2 py-0.5 text-xs dark:bg-brand-900">
                        {ROLE_LABEL[row.role]}
                      </span>
                    </td>
                    <td className="p-3">{merchantName(row)}</td>
                    {isSuperAdmin ? (
                      <td className="p-3">
                        {row.adminPasswordNote ? (
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                              {row.adminPasswordNote}
                            </code>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => copyPassword(row.adminPasswordNote)}
                            >
                              {t.staff.copyPassword}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">{t.staff.noPassword}</span>
                        )}
                      </td>
                    ) : null}
                    <td className="p-3">
                      <ActiveBadge
                        active={row.isActive}
                        label={row.isActive ? t.staff.statusActive : t.staff.statusBlocked}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={isSelf && row.isActive}
                          onClick={() => toggleActive(row)}
                        >
                          {row.isActive ? t.staff.blockAccess : t.staff.unblockAccess}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditRow(row);
                            setEditPassword('');
                          }}
                        >
                          {t.staff.editUser}
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

      <Modal open={createOpen} title={t.create} onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <Input
            placeholder="To‘liq ism"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Telefon (+998...)"
            value={form.phone ?? ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <PasswordInput
            placeholder="Parol (kamida 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div>
            <label className="text-xs text-zinc-500">Rol</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as StaffRole,
                  restaurantId: BUSINESS_ROLES.includes(e.target.value as StaffRole)
                    ? form.restaurantId
                    : '',
                })
              }
            >
              {creatableRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {needsBusiness && (
            <div>
              <label className="text-xs text-zinc-500">{t.staff.merchant}</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
                value={form.restaurantId ?? ''}
                onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
              >
                <option value="">Tanlang</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="button" onClick={submitCreate} disabled={create.isPending}>
              {create.isPending ? t.loading : t.save}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editRow}
        title={t.staff.editUser}
        onClose={() => {
          setEditRow(null);
          setEditPassword('');
        }}
      >
        {editRow && (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-semibold">{editRow.fullName ?? editRow.email}</span>
              <span className="text-zinc-500"> · {ROLE_LABEL[editRow.role]}</span>
            </p>
            {editRow.adminPasswordNote && (
              <p className="text-sm text-zinc-600">
                {t.staff.password}:{' '}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  {editRow.adminPasswordNote}
                </code>
              </p>
            )}
            <PasswordInput
              placeholder={t.staff.newPassword}
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            <p className="text-xs text-zinc-500">{t.staff.resetPasswordHint}</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditRow(null);
                  setEditPassword('');
                }}
              >
                {t.cancel}
              </Button>
              <Button type="button" onClick={submitEdit} disabled={update.isPending}>
                {update.isPending ? t.loading : t.save}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
