'use client';

import {
  Briefcase,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Package,
  Percent,
  Bell,
} from 'lucide-react';
import { ProfileMenuGroup } from '@/components/profile/profile-menu-group';
import { ProfileMenuRow } from '@/components/profile/profile-menu-row';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { useNotificationsSocket } from '@/hooks/use-notifications-socket';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { isCustomerLoggedIn } from '@/lib/customer';
import { uz } from '@/lib/uz';

const APP_VERSION = '1.2.1';

type Props = {
  loyaltyPoints?: number | null;
};

export function ProfileAccountMenu({ loyaltyPoints }: Props) {
  const loggedIn = isCustomerLoggedIn();
  const { unread, token } = useCustomerNotifications();
  useNotificationsSocket(!!token && loggedIn);
  const unreadCount = unread.data?.count ?? 0;
  const locale = getLocale();

  const toggleLocale = () => {
    const next: AppLocale = locale === 'uz' ? 'ru' : 'uz';
    setLocale(next);
  };

  return (
    <div className="mt-5 space-y-3">
      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={Package}
          label={uz.ordersTitle}
          href="/orders"
        />
        <ProfileMenuRow
          icon={Heart}
          label={uz.favoritesTitle}
          href="/favorites"
          showDivider={false}
        />
      </ProfileMenuGroup>

      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={Percent}
          label={uz.promotionsTitle}
          href="/promotions"
          trailing={
            loyaltyPoints != null && loyaltyPoints > 0
              ? `${loyaltyPoints}`
              : undefined
          }
        />
        <ProfileMenuRow
          icon={Bell}
          label={uz.notificationsTitle}
          href="/notifications"
          trailing={
            unreadCount > 0
              ? unreadCount > 99
                ? '99+'
                : String(unreadCount)
              : undefined
          }
          showDivider={loggedIn}
        />
        {loggedIn ? (
          <ProfileMenuRow
            icon={Briefcase}
            label={uz.profilePartnership}
            href="/hamkorlik"
            showDivider={false}
          />
        ) : null}
      </ProfileMenuGroup>

      <ProfileMenuGroup>
        <ProfileMenuRow
          icon={HelpCircle}
          label={uz.profileContact}
          href="/profile/help"
        />
        <ProfileMenuRow
          icon={Globe}
          label={uz.changeLanguage}
          hint={locale === 'uz' ? "O'zbekcha" : 'Русский'}
          onClick={toggleLocale}
        />
        <ProfileMenuRow
          icon={Info}
          label={uz.profileAboutApp}
          hint={uz.profileVersion(APP_VERSION)}
          showDivider={false}
        />
      </ProfileMenuGroup>
    </div>
  );
}
