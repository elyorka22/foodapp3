'use client';

import { Handshake, Package, Trash2 } from 'lucide-react';
import { ProfileMenuGroup } from '@/components/profile/profile-menu-group';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { uz } from '@/lib/uz';

type Props = {
  onDeleteAccount?: () => void;
  showDeleteAccount?: boolean;
};

export function ProfileAccountMenu({
  onDeleteAccount,
  showDeleteAccount = true,
}: Props) {
  return (
    <div className="mt-5 space-y-3">
      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={Package}
          label={uz.ordersTitle}
          href="/orders"
          showDivider={false}
        />
      </ProfileMenuGroup>

      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={Handshake}
          label={uz.profilePartnership}
          href="/hamkorlik"
          showDivider={showDeleteAccount}
        />
        {showDeleteAccount ? (
          <ProfileMenuRow
            icon={Trash2}
            label={uz.deleteAccountPage}
            href={onDeleteAccount ? undefined : '/delete-account'}
            onClick={onDeleteAccount}
            showDivider={false}
          />
        ) : null}
      </ProfileMenuGroup>
    </div>
  );
}
