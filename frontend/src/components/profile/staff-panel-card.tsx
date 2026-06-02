'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StaffLoginForm } from '@/components/auth/staff-login-form';
import { colors } from '@/lib/design-tokens';
import { clearAuth, dashboardPath, getToken, getUser, StaffUser } from '@/lib/auth';
import { uz } from '@/lib/uz';

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
    const label = uz.staffPanels[staff.role] ?? uz.staff;

    return (
      <Card className="mt-6 overflow-hidden border-[#FFD0AD] p-0">
        <div className="bg-hero-staff px-5 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.whiteAlpha80 }}>
            {uz.staffAccount}
          </p>
          <p className="mt-1 text-lg font-bold">{staff.fullName ?? staff.email}</p>
          <p className="text-sm" style={{ color: colors.whiteAlpha75 }}>
            {staff.role.replace(/_/g, ' ')}
          </p>
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
            {uz.staffSignOut}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border border-dashed border-[#FFD0AD] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Shield size={22} />
        </div>
        <div>
          <p className="font-semibold text-foreground">{uz.staffLoginTitle}</p>
          <p className="mt-1 text-sm text-foreground-muted">{uz.staffLoginHint}</p>
        </div>
      </div>
      <div className="mt-5">
        <StaffLoginForm redirect onSuccess={() => { if (getToken()) setStaff(getUser()); }} />
      </div>
      <Link href="/login" className="mt-4 block text-center text-sm font-medium text-primary">
        {uz.staffFullLogin}
      </Link>
    </Card>
  );
}
