'use client';

import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { ProfileAccountMenu } from '@/components/profile/profile-account-menu';
import { ProfileMenuGroup } from '@/components/profile/profile-menu-group';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { ProfilePageHeader } from '@/components/profile/profile-page-header';
import { ProfileSocialSection } from '@/components/profile/profile-social-section';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onAuthSuccess: (res: CustomerAuthResponse) => void;
};

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
      <ProfilePageHeader name={uz.profileGuestName} />

      <div className="mt-5 space-y-3">
        <ProfileMenuGroup>
          <ProfileMenuRow
            icon={LogIn}
            label={uz.signIn}
            hint={uz.profileLoginSubtitle}
            onClick={() => openAuth('login')}
          />
          <ProfileMenuRow
            icon={UserPlus}
            label={uz.register}
            hint={uz.profileRegisterSubtitle}
            onClick={() => openAuth('register')}
            showDivider={false}
          />
        </ProfileMenuGroup>
      </div>

      <ProfileAccountMenu />

      <ProfileSocialSection />

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
