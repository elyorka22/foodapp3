'use client';

import { useState } from 'react';
import { Globe, HelpCircle, Plus, UserPlus } from 'lucide-react';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { ProfileBannerGrid } from '@/components/profile/profile-banner-grid';
import { ProfileBannerTile } from '@/components/profile/profile-banner-tile';
import { ProfilePageHeader } from '@/components/profile/profile-page-header';
import { ProfileSocialSection } from '@/components/profile/profile-social-section';
import { ProfileStaffLoginButton } from '@/components/profile/profile-staff-login-button';
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

  const toggleLocale = () => {
    const next: AppLocale = getLocale() === 'uz' ? 'ru' : 'uz';
    setLocale(next);
  };

  return (
    <>
      <ProfilePageHeader name={uz.profileGuestName} />

      <ProfileBannerGrid>
        <ProfileBannerTile
          variant="accent"
          title={uz.signIn}
          subtitle={uz.profileLoginSubtitle}
          icon={Plus}
          onClick={() => openAuth('login')}
        />
        <ProfileBannerTile
          title={uz.register}
          subtitle={uz.profileRegisterSubtitle}
          icon={UserPlus}
          onClick={() => openAuth('register')}
        />
        <ProfileBannerTile
          title={uz.profileHelp}
          subtitle={uz.profileHelpHint}
          icon={HelpCircle}
          href="/profile/help"
        />
        <ProfileBannerTile
          title={uz.changeLanguage}
          subtitle={uz.profileLanguageSubtitle}
          icon={Globe}
          onClick={toggleLocale}
        />
      </ProfileBannerGrid>

      <ProfileSocialSection />

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
