'use client';

import { useState } from 'react';
import { Heart, MapPin, Package, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { ProfileInfoHelpSection } from '@/components/profile/profile-info-help-section';
import { ProfileStaffLoginButton } from '@/components/profile/profile-staff-login-button';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onAuthSuccess: (res: CustomerAuthResponse) => void;
};

const benefits = [
  { icon: Heart, label: uz.guestFeatureFavoritesTitle },
  { icon: Package, label: uz.guestFeatureOrdersTitle },
  { icon: MapPin, label: uz.guestFeatureAddressesTitle },
  { icon: Sparkles, label: uz.guestFeatureBonusesTitle },
] as const;

export function GuestProfileView({ onAuthSuccess }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthSheetMode>('login');
  const openAuth = (mode: AuthSheetMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (res: CustomerAuthResponse) => {
    setAuthOpen(false);
    onAuthSuccess(res);
  };

  return (
    <>
      <Card className="mt-5 rounded-2xl border-border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
            <UserRound size={22} className="text-foreground-muted" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-[17px] font-semibold leading-snug text-foreground">
              {uz.guestUserTitle}
            </h2>
            <p className="mt-1 text-[14px] leading-5 text-foreground-muted">
              {uz.guestUserDescription}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" size="lg" className="min-h-[52px] text-[15px]" onClick={() => openAuth('login')}>
            {uz.signIn}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="min-h-[52px] text-[15px]"
            onClick={() => openAuth('register')}
          >
            {uz.register}
          </Button>
        </div>
      </Card>

      <section className="mt-6" aria-label={uz.guestAccountBenefitsLabel}>
        <Card className="overflow-hidden rounded-2xl p-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 divide-x divide-y divide-border">
            {benefits.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center"
              >
                <Icon size={20} className="text-foreground-muted" strokeWidth={1.75} />
                <span className="text-[12px] font-medium leading-4 text-foreground-muted">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <ProfileInfoHelpSection />

      <ProfileStaffLoginButton className="mt-8" />

      <CustomerAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
