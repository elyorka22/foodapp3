'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StaffLoginForm } from '@/components/auth/staff-login-form';
import { PwaInstallButton } from '@/components/pwa/pwa-install-button';
import { PwaManifestLink } from '@/components/pwa/pwa-manifest-link';
import { dashboardPath, getToken, getUser } from '@/lib/auth';
import { adminI18n } from '@/lib/admin-i18n';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { pwaProfileFromAppParam } from '@/lib/pwa-profiles';
import { uz } from '@/lib/uz';

export function StaffLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const app = searchParams.get('app');
  const profile = pwaProfileFromAppParam(app);
  const installProfile = profile === 'customer' ? 'business' : profile;

  const copy = useMemo(() => {
    if (profile === 'admin') {
      return {
        title: adminI18n.pwa.installTitle,
        hint: adminI18n.pwa.installSubtitle,
      };
    }
    if (profile === 'business') {
      return {
        title: businessPanelI18n.pwa.installTitle,
        hint: businessPanelI18n.pwa.installSubtitle,
      };
    }
    return {
      title: uz.staffLoginTitle,
      hint: uz.staffLoginHint,
    };
  }, [profile]);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      router.replace(dashboardPath(user.role));
    }
  }, [router]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center bg-white px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <PwaManifestLink profile={installProfile} />
      <div className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+16px)]">
        <PwaInstallButton profile={installProfile} variant="panel" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">{copy.title}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{copy.hint}</p>

      <div className="mt-8">
        <StaffLoginForm redirect />
      </div>

      <Link
        href="/profile"
        className="mt-8 block text-center text-sm text-foreground-muted hover:text-primary"
      >
        ← {uz.backToProfile}
      </Link>
    </main>
  );
}
