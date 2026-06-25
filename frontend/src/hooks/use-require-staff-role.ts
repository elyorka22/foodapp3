'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardPath, getToken, getUser, type StaffUser } from '@/lib/auth';
import { isBusinessRole } from '@/lib/roles';
import { staffLoginUrlForPathname } from '@/lib/pwa-profiles';

type Options = {
  /** Allowed roles (e.g. 'MANAGER' or ['RESTAURANT_OWNER', 'RESTAURANT_STAFF']) */
  roles: string | string[];
};

/**
 * Waits for client mount before reading localStorage, then enforces staff role.
 * Avoids false redirects to /login during hydration.
 */
export function useRequireStaffRole({ roles }: Options) {
  const router = useRouter();
  const allowed = Array.isArray(roles) ? roles : [roles];
  const [state, setState] = useState<{
    ready: boolean;
    authorized: boolean;
    user: StaffUser | null;
    token: string | null;
  }>({ ready: false, authorized: false, user: null, token: null });

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      setState({ ready: true, authorized: false, user: null, token: null });
      router.replace(staffLoginUrlForPathname(window.location.pathname));
      return;
    }

    const roleOk =
      allowed.includes(user.role) ||
      (allowed.includes('BUSINESS') && isBusinessRole(user.role));

    if (!roleOk) {
      setState({ ready: true, authorized: false, user, token });
      router.replace(dashboardPath(user.role));
      return;
    }

    setState({ ready: true, authorized: true, user, token });
  }, [router, allowed.join(',')]);

  return state;
}
