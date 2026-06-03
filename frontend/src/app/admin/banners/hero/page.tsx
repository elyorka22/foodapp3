'use client';

import { AdminBannersPage } from '@/components/admin/admin-banners-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function HomepageHeroBannersPage() {
  return (
    <AdminBannersPage
      title={adminI18n.banners.heroTitle}
      hint={adminI18n.banners.heroHint}
      homepageOnly
      placementMode="HERO"
    />
  );
}
