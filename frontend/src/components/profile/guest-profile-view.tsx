'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
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

      <section className="mt-6" aria-labelledby="info-section-heading">
        <h2
          id="info-section-heading"
          className="mb-3 px-0.5 text-[15px] font-semibold text-foreground"
        >
          {uz.helpfulSections}
        </h2>
        <Card className="overflow-hidden rounded-2xl p-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <ProfileMenuRow
            icon={HelpCircle}
            label={uz.profileHelp}
            hint={uz.profileHelpHint}
            href="/notifications"
          />
          <ProfileMenuRow
            icon={Briefcase}
            label={uz.profilePartnership}
            hint={uz.profilePartnershipHint}
            href="mailto:partners@foodapp.uz"
          />
          <ProfileMenuRow icon={FileText} label={uz.termsOfUse} href="#" />
          <ProfileMenuRow
            icon={Globe}
            label={uz.changeLanguage}
            hint={locale === 'uz' ? "O'zbekcha" : 'Русский'}
            onClick={toggleLocale}
          />
        </Card>
      </section>

      <footer className="mt-8 pb-2">
        <Link
          href="/staff/login"
          className="block py-1 text-center text-[12px] text-foreground-subtle underline-offset-2 hover:text-foreground-muted hover:underline"
        >
          {uz.staffLoginForEmployees}
        </Link>
      </footer>

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
