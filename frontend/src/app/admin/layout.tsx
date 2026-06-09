import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminRealtime } from '@/components/admin/admin-realtime';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin | FoodApp',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <AdminRealtime />
      {children}
    </AdminShell>
  );
}

