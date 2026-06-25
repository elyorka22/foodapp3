import { adminI18n } from '@/lib/admin-i18n';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { uz } from '@/lib/uz';

export type PwaProfileId = 'customer' | 'business' | 'admin';

export type PwaInstallCopy = {
  aria: string;
  title: string;
  subtitle: string;
  description: string;
  appName: string;
  iconSrc: string;
  iosTitle: string;
  iosSubtitle: string;
  manualSubtitle: string;
  manualHint: string;
  confirm: string;
  cancel: string;
  installing: string;
  close: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
};

export const PWA_PROFILES: Record<
  PwaProfileId,
  { manifest: string; loginUrl: string; copy: PwaInstallCopy }
> = {
  customer: {
    manifest: '/manifest.json',
    loginUrl: '/login',
    copy: {
      aria: uz.pwaInstallAria,
      title: uz.pwaInstallTitle,
      subtitle: uz.pwaInstallSubtitle,
      description: uz.pwaInstallDescription,
      appName: 'FoodApp',
      iconSrc: '/icons/icon-192.png',
      iosTitle: uz.pwaIosInstallTitle,
      iosSubtitle: uz.pwaIosInstallSubtitle,
      manualSubtitle: uz.pwaManualInstallSubtitle,
      manualHint: uz.pwaManualInstallHint,
      confirm: uz.pwaInstallConfirm,
      cancel: uz.pwaInstallCancel,
      installing: uz.pwaInstallInstalling,
      close: uz.close,
      iosStep1: uz.pwaIosInstallStep1,
      iosStep2: uz.pwaIosInstallStep2,
      iosStep3: uz.pwaIosInstallStep3,
    },
  },
  business: {
    manifest: '/manifest-business.json',
    loginUrl: '/staff/login?app=business',
    copy: {
      aria: businessPanelI18n.pwa.installAria,
      title: businessPanelI18n.pwa.installTitle,
      subtitle: businessPanelI18n.pwa.installSubtitle,
      description: businessPanelI18n.pwa.installDescription,
      appName: businessPanelI18n.pwa.appName,
      iconSrc: '/icons/icon-192.png',
      iosTitle: businessPanelI18n.pwa.iosTitle,
      iosSubtitle: businessPanelI18n.pwa.iosSubtitle,
      manualSubtitle: uz.pwaManualInstallSubtitle,
      manualHint: uz.pwaManualInstallHint,
      confirm: uz.pwaInstallConfirm,
      cancel: uz.pwaInstallCancel,
      installing: uz.pwaInstallInstalling,
      close: uz.close,
      iosStep1: uz.pwaIosInstallStep1,
      iosStep2: uz.pwaIosInstallStep2,
      iosStep3: uz.pwaIosInstallStep3,
    },
  },
  admin: {
    manifest: '/manifest-admin.json',
    loginUrl: '/staff/login?app=admin',
    copy: {
      aria: adminI18n.pwa.installAria,
      title: adminI18n.pwa.installTitle,
      subtitle: adminI18n.pwa.installSubtitle,
      description: adminI18n.pwa.installDescription,
      appName: adminI18n.pwa.appName,
      iconSrc: '/icons/icon-192.png',
      iosTitle: adminI18n.pwa.iosTitle,
      iosSubtitle: adminI18n.pwa.iosSubtitle,
      manualSubtitle: uz.pwaManualInstallSubtitle,
      manualHint: uz.pwaManualInstallHint,
      confirm: uz.pwaInstallConfirm,
      cancel: uz.pwaInstallCancel,
      installing: uz.pwaInstallInstalling,
      close: uz.close,
      iosStep1: uz.pwaIosInstallStep1,
      iosStep2: uz.pwaIosInstallStep2,
      iosStep3: uz.pwaIosInstallStep3,
    },
  },
};

export function pwaProfileFromAppParam(app: string | null | undefined): PwaProfileId {
  if (app === 'admin') return 'admin';
  if (app === 'business') return 'business';
  return 'customer';
}

export function pwaProfileFromPathname(pathname: string): PwaProfileId {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/business')) return 'business';
  return 'customer';
}

export function staffLoginUrlForPathname(pathname: string): string {
  const profile = pwaProfileFromPathname(pathname);
  if (profile === 'admin') return PWA_PROFILES.admin.loginUrl;
  if (profile === 'business') return PWA_PROFILES.business.loginUrl;
  return '/staff/login';
}
