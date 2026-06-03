'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import {
  hasAdminPermission,
  isAdminPanelRole,
  type AdminPermission,
} from '@/lib/admin-permissions';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';

type Options = {
  /** Redirect to /admin if missing this permission */
  permission?: AdminPermission;
};

export function useAdminAccess(options?: Options) {
  const router = useRouter();
  const { ready, authorized } = useRequireStaffRole({
    roles: ['SUPER_ADMIN', 'MANAGER'],
  });
  const user = getUser();
  const role = user?.role;

  useEffect(() => {
    if (!ready || !authorized || !role) return;
    if (options?.permission && !hasAdminPermission(role, options.permission)) {
      router.replace('/admin');
    }
  }, [ready, authorized, role, options?.permission, router]);

  return {
    ready,
    authorized: authorized && isAdminPanelRole(role),
    role,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isManager: role === 'MANAGER',
    can: (permission: AdminPermission) => hasAdminPermission(role, permission),
  };
}
