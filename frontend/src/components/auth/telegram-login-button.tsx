'use client';

import { useEffect, useRef } from 'react';
import type { TelegramSignedUser } from '@/lib/customer-auth';

/**
 * Web-only UI: loads Telegram Login Widget and forwards the signed payload to the caller.
 * Authentication happens via `signInWithTelegram()` → backend — not in this component.
 */
type Props = {
  botUsername: string;
  onAuth: (user: TelegramSignedUser) => void;
};

export function TelegramLoginButton({ botUsername, onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    const handler = (user: TelegramSignedUser) => onAuth(user);
    (window as Window & { onTelegramAuth?: (u: TelegramSignedUser) => void }).onTelegramAuth =
      handler;

    const el = containerRef.current;
    el.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    el.appendChild(script);

    return () => {
      el.innerHTML = '';
      delete (window as Window & { onTelegramAuth?: (u: TelegramSignedUser) => void })
        .onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  return <div ref={containerRef} className="flex min-h-[52px] justify-center" />;
}
