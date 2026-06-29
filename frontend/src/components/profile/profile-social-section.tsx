'use client';

import { Instagram, Send, Youtube } from 'lucide-react';
import { ProfileBannerGrid } from '@/components/profile/profile-banner-grid';
import { ProfileBannerTile } from '@/components/profile/profile-banner-tile';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { openSocialUrl } from '@/lib/open-social-url';
import { uz } from '@/lib/uz';

export function ProfileSocialSection() {
  const settings = usePublicSettings();
  const instagram = settings.data?.social_instagram_url?.trim() ?? '';
  const telegram = settings.data?.social_telegram_url?.trim() ?? '';
  const youtube = settings.data?.social_youtube_url?.trim() ?? '';

  const tiles = [
    instagram
      ? {
          key: 'instagram',
          title: 'Instagram',
          icon: Instagram,
          onClick: () => openSocialUrl(instagram),
        }
      : null,
    telegram
      ? {
          key: 'telegram',
          title: 'Telegram',
          icon: Send,
          onClick: () => openSocialUrl(telegram),
        }
      : null,
    youtube
      ? {
          key: 'youtube',
          title: 'YouTube',
          icon: Youtube,
          onClick: () => openSocialUrl(youtube),
        }
      : null,
  ].filter((tile): tile is NonNullable<typeof tile> => tile != null);

  if (tiles.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="social-section-heading">
      <h2
        id="social-section-heading"
        className="mb-3 px-0.5 text-center text-[15px] font-semibold text-foreground"
      >
        {uz.profileSocialTitle}
      </h2>
      <ProfileBannerGrid>
        {tiles.map(({ key, title, icon, onClick }) => (
          <ProfileBannerTile
            key={key}
            title={title}
            subtitle={uz.profileSocialFollow}
            icon={icon}
            onClick={onClick}
          />
        ))}
      </ProfileBannerGrid>
    </section>
  );
}
