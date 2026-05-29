import { AdminShell } from '@/components/admin/admin-shell';
import { AdminRealtime } from '@/components/admin/admin-realtime';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <AdminRealtime />
      {children}
    </AdminShell>
  );
}

