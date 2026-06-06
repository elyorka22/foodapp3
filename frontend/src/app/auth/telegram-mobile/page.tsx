'use client';

import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import type { TelegramSignedUser } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

declare global {
  interface Window {
    FoodAppTelegram?: { postMessage: (message: string) => void };
  }
}

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

/** Loaded inside the customer mobile app WebView — domain must match BotFather `/setdomain`. */
export default function TelegramMobileAuthPage() {
  const handleAuth = (user: TelegramSignedUser) => {
    if (window.FoodAppTelegram?.postMessage) {
      window.FoodAppTelegram.postMessage(JSON.stringify(user));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
      {botUsername ? (
        <TelegramLoginButton botUsername={botUsername} onAuth={handleAuth} />
      ) : (
        <p className="text-center text-sm text-foreground-muted">{uz.telegramNotConfigured}</p>
      )}
    </main>
  );
}
