'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaffLoginForm } from '@/components/auth/staff-login-form';
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
    <div className="rounded-xl border-2 border-dashed border-brand-500/40 p-5">
      <p className="text-sm font-semibold text-brand-600">Staff / Super Admin login</p>
      <p className="mt-2 text-xs leading-relaxed opacity-70">
        Uses <strong>users</strong> table (email + password). Not the customer phone login above.
      </p>
      <div className="mt-4">
        <StaffLoginForm
          redirect
          onSuccess={() => {
            if (getToken()) setStaff(getUser());
          }}
        />
      </div>
      <Link href="/login" className="mt-3 block text-center text-xs text-brand-600 underline">
        Open full-screen staff login page
      </Link>
    </div>
  );
}
