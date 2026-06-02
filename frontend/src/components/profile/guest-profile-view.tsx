'use client';

import { useState } from 'react';
import {
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerAuthSheet, type AuthSheetMode } from '@/components/auth/customer-auth-sheet';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onAuthSuccess: (res: CustomerAuthResponse) => void;
};

const accountFeatures = [
  {
    icon: Heart,
    title: uz.guestFeatureFavoritesTitle,
    description: uz.guestFeatureFavoritesDesc,
    tint: 'text-rose-500 bg-rose-50',
  },
  {
    icon: Package,
    title: uz.guestFeatureOrdersTitle,
    description: uz.guestFeatureOrdersDesc,
    tint: 'text-brand-600 bg-brand-50',
  },
  {
    icon: MapPin,
    title: uz.guestFeatureAddressesTitle,
    description: uz.guestFeatureAddressesDesc,
    tint: 'text-sky-600 bg-sky-50',
  },
  {
    icon: Sparkles,
    title: uz.guestFeatureFastOrderTitle,
    description: uz.guestFeatureFastOrderDesc,
    tint: 'text-amber-600 bg-amber-50',
  },
] as const;

const helpLinks = [
  { label: uz.helpCenter, href: '/notifications' },
  { label: uz.contactUs, href: 'mailto:support@foodapp.uz' },
  { label: uz.termsOfUse, href: '#' },
  { label: uz.privacyPolicy, href: '#' },
] as const;

export function GuestProfileView({ onAuthSuccess }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthSheetMode>('login');
  const [staffOpen, setStaffOpen] = useState(false);

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
      <Card className="mt-4 overflow-hidden border-zinc-200 p-0">
        <div className="bg-gradient-to-br from-brand-50 via-white to-orange-50/40 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
              <UserCircle size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900">{uz.guestUserTitle}</p>
              <p className="mt-1 text-sm leading-5 text-zinc-600">{uz.guestUserDescription}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{uz.guestUserBenefits}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
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

      <section className="mt-6" aria-labelledby="account-benefits-heading">
        <h2 id="account-benefits-heading" className="text-sm font-semibold text-zinc-900">
          {uz.guestFeaturesSectionTitle}
        </h2>
        <ul className="mt-3 space-y-2">
          {accountFeatures.map((item) => (
            <li key={item.title}>
              <Card className="flex items-start gap-3 p-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tint}`}
                >
                  <item.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.description}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="help-section-heading">
        <h2 id="help-section-heading" className="text-sm font-semibold text-zinc-900">
          {uz.helpfulSections}
        </h2>
        <Card className="mt-3 divide-y divide-zinc-100 p-0">
          {helpLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex min-h-12 items-center justify-between px-4 py-3 text-sm text-zinc-800 active:bg-zinc-50"
            >
              <span>{item.label}</span>
              <ChevronRight size={16} className="text-zinc-400" />
            </a>
          ))}
        </Card>
      </section>

      <div className="mt-10 border-t border-zinc-200/80 pt-6">
        {!staffOpen ? (
          <button
            type="button"
            onClick={() => setStaffOpen(true)}
            className="w-full text-center text-xs text-zinc-400 underline-offset-2 hover:text-zinc-500 hover:underline"
          >
            {uz.openStaffLogin}
          </button>
        ) : (
          <div className="opacity-90">
            <StaffPanelCard />
          </div>
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
