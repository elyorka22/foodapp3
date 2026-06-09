'use client';

import { Instagram, Send, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileBannerGrid } from '@/components/profile/profile-banner-grid';
import { ProfileBannerTile } from '@/components/profile/profile-banner-tile';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';

function openSocialUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    toast.message(uz.profileSocialLinkMissing);
    return;
  }
  window.open(trimmed, '_blank', 'noopener,noreferrer');
}

export function ProfileSocialSection() {
  const settings = usePublicSettings();
  const instagram = settings.data?.social_instagram_url?.trim() ?? '';
  const telegram = settings.data?.social_telegram_url?.trim() ?? '';
  const youtube = settings.data?.social_youtube_url?.trim() ?? '';

  return (
    <section className="mt-6" aria-labelledby="social-section-heading">
      <h2
        id="social-section-heading"
        className="mb-3 px-0.5 text-center text-[15px] font-semibold text-foreground"
      >
        {uz.profileSocialTitle}
      </h2>
      <ProfileBannerGrid>
        <ProfileBannerTile
          title="Instagram"
          subtitle={uz.profileSocialFollow}
          icon={Instagram}
          className={instagram ? undefined : 'opacity-55'}
          onClick={() => openSocialUrl(instagram)}
        />
        <ProfileBannerTile
          title="Telegram"
          subtitle={uz.profileSocialFollow}
          icon={Send}
          className={telegram ? undefined : 'opacity-55'}
          onClick={() => openSocialUrl(telegram)}
        />
        <ProfileBannerTile
          title="YouTube"
          subtitle={uz.profileSocialFollow}
          icon={Youtube}
          className={youtube ? undefined : 'opacity-55'}
          onClick={() => openSocialUrl(youtube)}
        />
      </ProfileBannerGrid>
    </section>
  );
}
