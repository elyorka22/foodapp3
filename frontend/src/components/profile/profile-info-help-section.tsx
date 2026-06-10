'use client';

import { useEffect, useState } from 'react';
import { Briefcase, FileText, Globe, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { uz } from '@/lib/uz';

export function ProfileInfoHelpSection() {
  const [locale, setLocaleState] = useState<AppLocale>('uz');

  useEffect(() => {
    setLocaleState(getLocale());
  }, []);

  const toggleLocale = () => {
    const next: AppLocale = locale === 'uz' ? 'ru' : 'uz';
    setLocale(next);
    setLocaleState(next);
  };

  return (
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
          href="/profile/help"
        />
        <ProfileMenuRow
          icon={Briefcase}
          label={uz.profilePartnership}
          hint={uz.profilePartnershipHint}
          href="/profile/partnership"
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
  );
}
