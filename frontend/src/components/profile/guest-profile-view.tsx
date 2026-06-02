'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Globe,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  Phone,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { LoginPromptSheet } from '@/components/profile/login-prompt-sheet';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { colors, shadows } from '@/lib/design-tokens';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { uz } from '@/lib/uz';

type Props = {
  onAuthSuccess: (res: CustomerAuthResponse) => void;
};

const quickActions = [
  { icon: Heart, title: uz.guestFeatureFavoritesTitle, key: 'favorites' },
  { icon: Package, title: uz.guestFeatureOrdersTitle, key: 'orders' },
  { icon: MapPin, title: uz.guestFeatureAddressesTitle, key: 'addresses' },
  { icon: Sparkles, title: uz.guestFeatureFastOrderTitle, key: 'fast' },
] as const;

const helpLinks = [
  { label: uz.helpCenter, href: '/notifications', icon: HelpCircle },
  { label: uz.contactUs, href: 'mailto:support@foodapp.uz', icon: Phone },
  { label: uz.termsOfUse, href: '#', icon: FileText },
  { label: uz.privacyPolicy, href: '#', icon: Shield },
] as const;

export function GuestProfileView({ onAuthSuccess }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthSheetMode>('login');
  const [staffOpen, setStaffOpen] = useState(false);
  const [promptFeature, setPromptFeature] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<AppLocale>('uz');

  useEffect(() => {
    setLocaleState(getLocale());
  }, []);

  const openAuth = (mode: AuthSheetMode) => {
    setPromptFeature(null);
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (res: CustomerAuthResponse) => {
    setAuthOpen(false);
    setPromptFeature(null);
    onAuthSuccess(res);
  };

  const toggleLocale = () => {
    const next: AppLocale = locale === 'uz' ? 'ru' : 'uz';
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <>
      <Card className="mt-5 overflow-hidden border-0 p-0" style={{ boxShadow: shadows.cardElevated }}>
        <div className="relative bg-hero-primary px-5 pb-5 pt-6 text-white">
          <div
            className="absolute -right-6 -top-6 h-28 w-28 rounded-full"
            style={{ backgroundColor: colors.whiteAlpha10 }}
          />
          <div
            className="absolute -bottom-8 left-8 h-20 w-20 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          />
          <div className="relative flex items-start gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: colors.whiteAlpha20 }}
            >
              <UserRound size={30} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: colors.whiteAlpha85 }}>
                {uz.guestGreeting}
              </p>
              <p className="mt-0.5 text-xl font-bold leading-tight">{uz.guestUserTitle}</p>
            </div>
          </div>
          <p className="relative mt-3 text-sm leading-6" style={{ color: colors.whiteAlpha90 }}>
            {uz.guestUserDescription}
          </p>
        </div>
        <div className="space-y-3 bg-surface px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {uz.guestAccountBenefitsLabel}
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs text-foreground-muted">
            <li className="rounded-2xl bg-background px-3 py-2">❤️ {uz.guestFeatureFavoritesTitle}</li>
            <li className="rounded-2xl bg-background px-3 py-2">📦 {uz.guestFeatureOrdersTitle}</li>
            <li className="rounded-2xl bg-background px-3 py-2">📍 {uz.guestFeatureAddressesTitle}</li>
            <li className="rounded-2xl bg-background px-3 py-2">⚡️ {uz.guestFeatureFastOrderTitle}</li>
          </ul>
          <div className="flex gap-2 pt-1">
            <Button type="button" size="lg" className="flex-1" onClick={() => openAuth('login')}>
              {uz.signIn}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={() => openAuth('register')}
            >
              {uz.register}
            </Button>
          </div>
        </div>
      </Card>

      <section className="mt-7" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="px-0.5 text-[15px] font-semibold text-foreground">
          {uz.quickActions}
        </h2>
        <Card className="mt-3 grid grid-cols-2 overflow-hidden p-0">
          {quickActions.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPromptFeature(item.title)}
              className="flex min-h-[88px] flex-col items-center justify-center gap-2 bg-surface px-3 py-4 active:bg-background"
              style={{
                borderRight: index % 2 === 0 ? `1px solid ${colors.border}` : undefined,
                borderBottom: index < 2 ? `1px solid ${colors.border}` : undefined,
              }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <item.icon size={20} />
              </div>
              <span className="text-center text-xs font-medium leading-4 text-foreground">
                {item.title}
              </span>
            </button>
          ))}
        </Card>
      </section>

      <section className="mt-7" aria-labelledby="help-section-heading">
        <h2 id="help-section-heading" className="px-0.5 text-[15px] font-semibold text-foreground">
          {uz.helpfulSections}
        </h2>
        <Card className="mt-3 overflow-hidden p-0">
          {helpLinks.map((item) => (
            <ProfileMenuRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
            />
          ))}
        </Card>
      </section>

      <section className="mt-7" aria-labelledby="language-heading">
        <h2 id="language-heading" className="px-0.5 text-[15px] font-semibold text-foreground">
          {uz.languageSection}
        </h2>
        <Card className="mt-3 overflow-hidden p-0">
          <ProfileMenuRow
            icon={Globe}
            label={uz.changeLanguage}
            hint={locale === 'uz' ? "O'zbekcha" : 'Русский'}
            iconClassName="bg-[#E0F2FE] text-[#0284C7]"
            onClick={toggleLocale}
          />
        </Card>
      </section>

      <div className="mt-12 border-t border-border pt-5">
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

      <LoginPromptSheet
        open={!!promptFeature}
        featureTitle={promptFeature ?? ''}
        onClose={() => setPromptFeature(null)}
        onLogin={() => openAuth('login')}
      />

      <CustomerAuthSheet
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
