'use client';

import { AdminBannersPage } from '@/components/admin/admin-banners-page';
import { adminI18n } from '@/lib/admin-i18n';

/** New home design: single «Maxsus takliflar» carousel (PROMO placement). */
export default function HomepageOffersBannersPage() {
  return (
    <AdminBannersPage
      title={adminI18n.banners.homeGridTitle}
      hint={adminI18n.banners.homeGridHint}
      homepageOnly
      placementMode="PROMO"
    />
  );
}
