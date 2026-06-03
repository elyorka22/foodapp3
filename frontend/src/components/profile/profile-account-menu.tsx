'use client';

import { Bell, Heart, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { uz } from '@/lib/uz';

export function ProfileAccountMenu() {
  return (
    <section className="mt-6" aria-label={uz.guestFeaturesSectionTitle}>
      <Card className="overflow-hidden rounded-2xl p-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <ProfileMenuRow
          icon={Package}
          label={uz.guestFeatureOrdersTitle}
          hint={uz.guestFeatureOrdersDesc}
          href="/orders"
        />
        <ProfileMenuRow
          icon={Heart}
          label={uz.guestFeatureFavoritesTitle}
          hint={uz.guestFeatureFavoritesDesc}
          href="/favorites"
        />
        <ProfileMenuRow icon={Bell} label={uz.notificationsTitle} href="/notifications" />
      </Card>
    </section>
  );
}
