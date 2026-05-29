'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearAuth, dashboardPath, getToken, getUser, StaffUser } from '@/lib/auth';

const PANEL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin Panel',
  MANAGER: 'Manager Panel',
  RESTAURANT_OWNER: 'Restaurant Panel',
  RESTAURANT_STAFF: 'Restaurant Panel',
  COURIER: 'Courier Panel',
};

export function StaffPanelCard() {
  const [staff, setStaff] = useState<StaffUser | null>(null);

  useEffect(() => {
    if (getToken()) setStaff(getUser());
  }, []);

  const staffLogout = () => {
    clearAuth();
    setStaff(null);
  };

  if (staff) {
    const href = dashboardPath(staff.role);
    const label = PANEL_LABELS[staff.role] ?? 'Staff Panel';

    return (
      <div className="mt-6 rounded-xl border-2 border-brand-500/30 bg-brand-50 p-5 dark:border-brand-500/40 dark:bg-brand-950/40">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Staff account</p>
        <p className="mt-1 font-semibold">{staff.fullName ?? staff.email}</p>
        <p className="text-xs opacity-60">{staff.role.replace(/_/g, ' ')}</p>
        <Link href={href} className="mt-4 block">
          <Button type="button" size="lg" className="w-full gap-2">
            <LayoutDashboard size={20} />
            {label}
          </Button>
        </Link>
        <button
          type="button"
          onClick={staffLogout}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-red-500"
        >
          <LogOut size={16} /> Staff logout
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border p-5 dark:border-white/10">
      <p className="text-sm font-medium">Administration</p>
      <p className="mt-1 text-xs opacity-70">
        Super admin, manager, restaurant or courier — sign in with email
      </p>
      <Link href="/login" className="mt-4 block">
        <Button type="button" size="lg" variant="secondary" className="w-full gap-2">
          <LayoutDashboard size={20} />
          Staff / Super Admin login
        </Button>
      </Link>
    </div>
  );
}
