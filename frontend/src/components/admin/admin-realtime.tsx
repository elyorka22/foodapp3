'use client';

import { useAdminSocket } from '@/hooks/use-admin-socket';

export function AdminRealtime() {
  useAdminSocket();
  return null;
}
