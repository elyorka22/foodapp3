'use client';

import { Package } from 'lucide-react';
import { ProfileMenuGroup } from '@/components/profile/profile-menu-group';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { uz } from '@/lib/uz';

export function ProfileAccountMenu() {
  return (
    <div className="mt-5">
      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={Package}
          label={uz.ordersTitle}
          href="/orders"
          showDivider={false}
        />
      </ProfileMenuGroup>
    </div>
  );
}
