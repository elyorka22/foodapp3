'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  useAdminUsers,
  type CreateStaffUserForm,
  type StaffRole,
} from '@/hooks/use-admin-users';
import { Modal } from '@/components/admin/modal';
import { ActiveBadge } from '@/components/admin/active-badge';
import { EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROLES: { value: StaffRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'COURIER', label: 'Courier' },
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
  ROLES.map((r) => [r.value, r.label]),
) as Record<StaffRole, string>;

export default function AdminUsersPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [roleFilter, setRoleFilter] = useState<StaffRole | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);

  const { list, create } = useAdminUsers(roleFilter || undefined);

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/staff/login');
  }, [token, user, router]);

  useEffect(() => {
    if (!token) return;
    api<{ data: { id: string; name: string }[] }>('/restaurants/admin?limit=100', { token })
      .then((res) => setRestaurants(res.data ?? []))
      .catch(() => undefined);
  }, [token]);

  const rows = list.data ?? [];
  const needsBusiness = BUSINESS_ROLES.includes(form.role);

  const submitCreate = async () => {
    if (!form.email.trim() || !form.password || form.password.length < 6) {
      toast.error('Email and password (min 6 chars) are required');
      return;
    }
    if (needsBusiness && !form.restaurantId) {
      toast.error('Select a business for this role');
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
      toast.success('User created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create user');
    }
  };

  if (list.isLoading) return <LoadingState label="Loading users..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Staff users</h1>
          <p className="text-sm opacity-60">Create accounts with role for admin, manager, restaurant, or courier</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          + New user
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <label className="text-xs opacity-60">Filter by role</label>
        <select
          className="mt-1 w-full max-w-xs rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as StaffRole | '')}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {!rows.length ? (
        <EmptyState title="No users" description="Create a staff user with the button above." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs opacity-70 dark:bg-zinc-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3">Restaurant</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t dark:border-white/10">
                  <td className="p-3 font-medium">{row.fullName ?? '—'}</td>
                  <td className="p-3">{row.email ?? '—'}</td>
                  <td className="p-3">{row.phone ?? '—'}</td>
                  <td className="p-3">
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs dark:bg-brand-900">
                      {ROLE_LABEL[row.role]}
                    </span>
                  </td>
                  <td className="p-3">{row.restaurant?.name ?? '—'}</td>
                  <td className="p-3">
                    <ActiveBadge active={row.isActive} />
                  </td>
                  <td className="p-3 text-xs opacity-70">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} title="Create staff user" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <Input
            placeholder="Full name"
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
            placeholder="Phone (+998...)"
            value={form.phone ?? ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password (min 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div>
            <label className="text-xs opacity-60">Role</label>
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
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {needsBusiness && (
            <div>
              <label className="text-xs opacity-60">Restaurant</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
                value={form.restaurantId ?? ''}
                onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
              >
                <option value="">Select restaurant</option>
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
              Cancel
            </Button>
            <Button type="button" onClick={submitCreate} disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
