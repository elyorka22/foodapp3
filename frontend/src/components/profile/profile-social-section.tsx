'use client';

import { Instagram, Send, Youtube } from 'lucide-react';
import { ProfileBannerGrid } from '@/components/profile/profile-banner-grid';
import { ProfileBannerTile } from '@/components/profile/profile-banner-tile';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';

export function ProfileSocialSection() {
  const settings = usePublicSettings();
  const instagram = settings.data?.social_instagram_url?.trim() ?? '';
  const telegram = settings.data?.social_telegram_url?.trim() ?? '';
  const youtube = settings.data?.social_youtube_url?.trim() ?? '';

  if (!instagram && !telegram && !youtube) return null;

  return (
    <section className="mt-6" aria-labelledby="social-section-heading">
      <h2
        id="social-section-heading"
        className="mb-3 px-0.5 text-center text-[15px] font-semibold text-foreground"
      >
        {uz.profileSocialTitle}
      </h2>
      <ProfileBannerGrid>
        {instagram ? (
          <ProfileBannerTile
            title="Instagram"
            subtitle={uz.profileSocialFollow}
            icon={Instagram}
            onClick={() => window.open(instagram, '_blank', 'noopener,noreferrer')}
          />
        ) : null}
        {telegram ? (
          <ProfileBannerTile
            title="Telegram"
            subtitle={uz.profileSocialFollow}
            icon={Send}
            onClick={() => window.open(telegram, '_blank', 'noopener,noreferrer')}
          />
        ) : null}
        {youtube ? (
          <ProfileBannerTile
            title="YouTube"
            subtitle={uz.profileSocialFollow}
            icon={Youtube}
            onClick={() => window.open(youtube, '_blank', 'noopener,noreferrer')}
          />
        ) : null}
      </ProfileBannerGrid>
    </section>
  );
}
