'use client';

import { Bell, Briefcase, FileText, Globe, Heart, HelpCircle, Package, Plus, Sparkles } from 'lucide-react';
import { ProfileBannerGrid } from '@/components/profile/profile-banner-grid';
import { ProfileBannerTile } from '@/components/profile/profile-banner-tile';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { useNotificationsSocket } from '@/hooks/use-notifications-socket';
import { getLocale, setLocale, type AppLocale } from '@/lib/locale';
import { isCustomerLoggedIn } from '@/lib/customer';
import { uz } from '@/lib/uz';

export function ProfileAccountMenu() {
  const loggedIn = isCustomerLoggedIn();
  const { unread, token } = useCustomerNotifications();
  useNotificationsSocket(!!token && loggedIn);
  const unreadCount = unread.data?.count ?? 0;

  const toggleLocale = () => {
    const next: AppLocale = getLocale() === 'uz' ? 'ru' : 'uz';
    setLocale(next);
  };

  return (
    <ProfileBannerGrid>
      <ProfileBannerTile
        title={uz.notificationsTitle}
        subtitle={uz.profileNotificationsSubtitle}
        heroText={unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : undefined}
        href="/notifications"
        icon={unreadCount > 0 ? undefined : Bell}
      />
      <ProfileBannerTile
        variant="accent"
        title={uz.promotionsTitle}
        subtitle={uz.profilePromotionsSubtitle}
        href="/promotions"
        icon={Plus}
      />
      <ProfileBannerTile
        title={uz.guestFeatureOrdersTitle}
        subtitle={uz.guestFeatureOrdersDesc}
        href="/orders"
        icon={Package}
      />
      <ProfileBannerTile
        title={uz.guestFeatureFavoritesTitle}
        subtitle={uz.guestFeatureFavoritesDesc}
        href="/favorites"
        icon={Heart}
      />
      <ProfileBannerTile
        title={uz.changeLanguage}
        subtitle={uz.profileLanguageSubtitle}
        icon={Globe}
        onClick={toggleLocale}
      />
      <ProfileBannerTile
        title={uz.profileHelp}
        subtitle={uz.profileHelpSubtitle}
        href="/profile/help"
        icon={HelpCircle}
      />
      {loggedIn ? (
        <ProfileBannerTile
          title={uz.profilePartnership}
          subtitle={uz.profilePartnershipHint}
          href="/profile/partnership"
          icon={Briefcase}
        />
      ) : null}
      <ProfileBannerTile
        title={uz.termsOfUse}
        subtitle={uz.profileTermsSubtitle}
        href="#"
        icon={FileText}
      />
      <ProfileBannerTile
        title={uz.guestFeatureBonusesTitle}
        subtitle={uz.guestPromoBanner}
        href="/promotions"
        icon={Sparkles}
        heroClassName="text-[#C9A227]"
      />
    </ProfileBannerGrid>
  );
}
