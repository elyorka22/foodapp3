'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type StaffRole =
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'RESTAURANT_OWNER'
  | 'RESTAURANT_STAFF'
  | 'COURIER';

export type StaffUser = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  restaurant?: { id: string; name: string } | null;
};

export type CreateStaffUserForm = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: StaffRole;
  restaurantId?: string;
};

export function useAdminUsers(role?: StaffRole) {
  const token = getToken();
  const qc = useQueryClient();

  const params = role ? `?role=${role}` : '';

  const list = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => api<StaffUser[]>(`/users${params}`, { token: token ?? undefined }),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: CreateStaffUserForm) =>
      api<StaffUser>('/users', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return { list, create };
}
