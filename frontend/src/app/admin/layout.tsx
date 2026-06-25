import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminRealtime } from '@/components/admin/admin-realtime';
import { PwaManifestLink } from '@/components/pwa/pwa-manifest-link';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin | FoodApp',
  path: '/admin',
  noIndex: true,
  manifest: '/manifest-admin.json',
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <PwaManifestLink profile="admin" />
      <AdminRealtime />
      {children}
    </AdminShell>
  );
}

