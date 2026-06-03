'use client';

import { useAdminAccess } from '@/hooks/use-admin-access';
import { LoadingState } from '@/components/admin/ui';
import { adminI18n as t } from '@/lib/admin-i18n';
import type { AdminPermission } from '@/lib/admin-permissions';

type Props = {
  permission: AdminPermission;
  children: React.ReactNode;
};

/** Ensures staff role and permission before rendering admin page content. */
export function AdminPageGuard({ permission, children }: Props) {
  const { ready, authorized } = useAdminAccess({ permission });

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;

  return <>{children}</>;
}
