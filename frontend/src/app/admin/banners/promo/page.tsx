'use client';

import { AdminBannersPage } from '@/components/admin/admin-banners-page';
import { adminI18n } from '@/lib/admin-i18n';

export default function HomepagePromoBannersPage() {
  return (
    <AdminBannersPage
      title={adminI18n.banners.promoTitle}
      hint={adminI18n.banners.promoHint}
      homepageOnly
      placementMode="PROMO"
    />
  );
}
