'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import {
  customerNeedsPhone,
  isCustomerLoggedIn,
  type CustomerProfile,
} from '@/lib/customer';
import {
  persistCustomerSession,
  signInWithPhone,
  signInWithTelegram,
  type TelegramSignedUser,
} from '@/lib/customer-auth';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'telegram' | 'phone'>('telegram');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace(customerNeedsPhone() ? '/complete-profile' : '/');
    }
  }, [router]);

  const afterAuth = useCallback(
    (user: CustomerProfile) => {
      if (user.needsPhone || !user.phone) {
        router.replace('/complete-profile');
      } else {
        router.replace('/');
      }
    },
    [router],
  );

  const handleTelegram = async (payload: TelegramSignedUser) => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithTelegram(payload);
      persistCustomerSession(res);
      afterAuth(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signInWithPhone(phone);
      persistCustomerSession(res);
      afterAuth(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
        {uz.signIn}
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-500">{uz.loginSubtitle}</p>

      <Card className="mt-8 space-y-4 p-5">
        {mode === 'telegram' ? (
          <>
            {botUsername ? (
              <div className={clsx(loading && 'pointer-events-none opacity-60')}>
                <TelegramLoginButton botUsername={botUsername} onAuth={handleTelegram} />
              </div>
            ) : (
              <p className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-900">
                {uz.telegramNotConfigured}
              </p>
            )}
            <p className="text-center text-xs text-zinc-400">{uz.telegramLoginHint}</p>
          </>
        ) : (
          <form onSubmit={handlePhoneLogin} className="space-y-3">
            <Input
              type="tel"
              placeholder={uz.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? uz.signingIn : uz.signIn}
            </Button>
          </form>
        )}

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs text-zinc-400">{uz.or}</p>
        </div>

        {mode === 'telegram' ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setMode('phone')}
          >
            <Phone className="h-4 w-4" />
            {uz.loginWithPhone}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full gap-2 bg-[#2AABEE] text-white hover:bg-[#229ED9]"
            onClick={() => setMode('telegram')}
          >
            <MessageCircle className="h-4 w-4" />
            {uz.loginWithTelegram}
          </Button>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {uz.noAccount}{' '}
        <Link href="/auth/register" className="font-semibold text-brand-600">
          {uz.register}
        </Link>
      </p>

      <Link href="/" className="mt-4 text-center text-sm text-zinc-400">
        {uz.backToSite}
      </Link>
    </main>
  );
}
