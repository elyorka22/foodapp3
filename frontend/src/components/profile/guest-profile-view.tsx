'use client';

import { useEffect, useState } from 'react';
import { Briefcase, FileText, Globe, HelpCircle, Sparkles, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { colors, shadows } from '@/lib/design-tokens';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { uz } from '@/lib/uz';

type Props = {
  onAuthSuccess: (res: CustomerAuthResponse) => void;
};

const benefitPills = [
  { emoji: '❤️', label: uz.guestFeatureFavoritesTitle },
  { emoji: '📦', label: uz.guestFeatureOrdersTitle },
  { emoji: '📍', label: uz.guestFeatureAddressesTitle },
  { emoji: '⚡️', label: uz.guestFeatureBonusesTitle },
] as const;

export function GuestProfileView({ onAuthSuccess }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthSheetMode>('login');
  const [staffOpen, setStaffOpen] = useState(false);
  const [locale, setLocaleState] = useState<AppLocale>('uz');

  useEffect(() => {
    setLocaleState(getLocale());
  }, []);

  const openAuth = (mode: AuthSheetMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (res: CustomerAuthResponse) => {
    setAuthOpen(false);
    onAuthSuccess(res);
  };

  const toggleLocale = () => {
    const next: AppLocale = locale === 'uz' ? 'ru' : 'uz';
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <>
      {/* Hero card — guest identity, benefits, conversion CTAs */}
      <Card
        className="mt-4 overflow-hidden border-0 p-0"
        style={{ boxShadow: shadows.cardElevated, borderRadius: '24px' }}
      >
        <div className="relative bg-hero-primary px-5 pb-6 pt-5 text-white">
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
            style={{ backgroundColor: colors.whiteAlpha10 }}
          />
          <div
            className="absolute -bottom-10 left-6 h-24 w-24 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          />

          <div className="relative flex items-center gap-3.5">
            <div
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px]"
              style={{ backgroundColor: colors.whiteAlpha20 }}
            >
              <UserRound size={28} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight tracking-tight">{uz.guestUserTitle}</p>
            </div>
          </div>

          <p className="relative mt-2.5 text-[14px] leading-5" style={{ color: colors.whiteAlpha90 }}>
            {uz.guestUserDescription}
          </p>

          <ul className="relative mt-4 flex flex-wrap gap-2">
            {benefitPills.map((item) => (
              <li
                key={item.label}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium leading-none"
                style={{ backgroundColor: colors.whiteAlpha20, color: '#FFFFFF' }}
              >
                <span aria-hidden>{item.emoji}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2.5 bg-surface px-4 py-4">
          <Button
            type="button"
            size="lg"
            className="min-h-[52px] flex-1 text-[15px]"
            onClick={() => openAuth('login')}
          >
            {uz.signIn}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="min-h-[52px] flex-1 text-[15px]"
            onClick={() => openAuth('register')}
          >
            {uz.register}
          </Button>
        </div>
      </Card>

      {/* Promo nudge */}
      <div
        className="mt-4 flex items-start gap-3 rounded-[20px] border border-[#FFE8D6] bg-primary-soft px-4 py-3.5"
        style={{ boxShadow: shadows.card }}
      >
        <Sparkles size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={2} />
        <p className="text-[13px] leading-5 text-foreground">{uz.guestPromoBanner}</p>
      </div>

      {/* Useful links — single list, no duplicates */}
      <section className="mt-6" aria-labelledby="useful-sections-heading">
        <h2
          id="useful-sections-heading"
          className="mb-2.5 px-0.5 text-[13px] font-semibold uppercase tracking-wide text-foreground-subtle"
        >
          {uz.helpfulSections}
        </h2>
        <Card className="overflow-hidden p-0" style={{ borderRadius: '20px' }}>
          <ProfileMenuRow
            icon={HelpCircle}
            label={uz.profileHelp}
            hint={uz.profileHelpHint}
            href="/notifications"
            iconClassName="bg-[#FFF4EB] text-primary"
          />
          <ProfileMenuRow
            icon={Briefcase}
            label={uz.profilePartnership}
            hint={uz.profilePartnershipHint}
            href="mailto:partners@foodapp.uz"
            iconClassName="bg-[#FFF4EB] text-primary"
          />
          <ProfileMenuRow
            icon={FileText}
            label={uz.termsOfUse}
            href="#"
            iconClassName="bg-background text-foreground-muted"
          />
          <ProfileMenuRow
            icon={Globe}
            label={uz.changeLanguage}
            hint={locale === 'uz' ? "O'zbekcha" : 'Русский'}
            iconClassName="bg-[#E0F2FE] text-[#0284C7]"
            onClick={toggleLocale}
          />
        </Card>
      </section>

      {/* Staff entry — minimal */}
      <div className="mt-10 border-t border-border pt-4">
        {!staffOpen ? (
          <button
            type="button"
            onClick={() => setStaffOpen(true)}
            className="w-full py-2 text-center text-[11px] text-foreground-subtle"
          >
            {uz.openStaffLogin}
          </button>
        ) : (
          <StaffPanelCard />
        )}
      </div>

      <CustomerAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
