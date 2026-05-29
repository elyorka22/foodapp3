'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <Card className="mt-6 overflow-hidden border-brand-200/60 p-0 dark:border-brand-800/40">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Staff account</p>
          <p className="mt-1 text-lg font-bold">{staff.fullName ?? staff.email}</p>
          <p className="text-sm text-white/75">{staff.role.replace(/_/g, ' ')}</p>
        </div>
        <div className="space-y-3 p-5">
          <Link href={href} className="block">
            <Button type="button" size="lg" className="w-full gap-2">
              <LayoutDashboard size={20} />
              {label}
            </Button>
          </Link>
          <button
            type="button"
            onClick={staffLogout}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium text-red-600 active:bg-red-50"
          >
            <LogOut size={18} />
            Sign out of staff account
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-dashed border-brand-300/50 p-5 dark:border-brand-800/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Shield size={22} />
        </div>
        <div>
          <p className="font-semibold">Staff & Super Admin</p>
          <p className="mt-1 text-sm text-zinc-500">Sign in with work email and password.</p>
        </div>
      </div>
      <div className="mt-5">
        <StaffLoginForm redirect onSuccess={() => { if (getToken()) setStaff(getUser()); }} />
      </div>
      <Link href="/login" className="mt-4 block text-center text-sm font-medium text-brand-600">
        Open full-screen login
      </Link>
    </Card>
  );
}
