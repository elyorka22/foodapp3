'use client';

import { Instagram, Youtube } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { openSocialUrl } from '@/lib/open-social-url';
import { uz } from '@/lib/uz';

export function ProfileSocialSection() {
  const settings = usePublicSettings();
  const instagram = settings.data?.social_instagram_url?.trim() ?? '';
  const youtube = settings.data?.social_youtube_url?.trim() ?? '';

  const links = [
    instagram
      ? {
          key: 'instagram',
          label: 'Instagram',
          icon: Instagram,
          color: '#E1306C',
          onClick: () => openSocialUrl(instagram),
        }
      : null,
    youtube
      ? {
          key: 'youtube',
          label: 'YouTube',
          icon: Youtube,
          color: '#FF0000',
          onClick: () => openSocialUrl(youtube),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item != null);

  if (links.length === 0) return null;

  return (
    <section className="mt-5" aria-label={uz.profileSocialTitle}>
      <div className="flex gap-2.5">
        {links.map(({ key, label, icon: Icon, color, onClick }) => (
          <button
            key={key}
            type="button"
            aria-label={label}
            onClick={onClick}
            className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-[#E7F6EC] transition active:scale-[0.98]"
          >
            <Icon size={26} strokeWidth={1.75} style={{ color }} />
          </button>
        ))}
      </div>
    </section>
  );
}
