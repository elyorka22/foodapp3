'use client';

import { TelegramIcon } from '@/components/icons/telegram-icon';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { openSocialUrl } from '@/lib/open-social-url';
import { uz } from '@/lib/uz';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95';

type Props = {
  className?: string;
};

export function TelegramSocialButton({ className }: Props) {
  const settings = usePublicSettings();
  const telegram = settings.data?.social_telegram_url?.trim() ?? '';

  return (
    <button
      type="button"
      onClick={() => openSocialUrl(telegram)}
      aria-label={uz.telegramSocialAria}
      className={`${className ?? iconButtonClass}${telegram ? '' : ' opacity-55'}`}
    >
      <TelegramIcon size={24} />
    </button>
  );
}
