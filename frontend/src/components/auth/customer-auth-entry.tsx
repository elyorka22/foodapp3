'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  persistCustomerSession,
  signInWithPhone,
  signInWithTelegram,
  type TelegramSignedUser,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type Props = {
  title?: string;
  description?: string;
  showRegisterFooter?: boolean;
  /** Sheet/modal: hide page-level heading, tighter layout */
  compact?: boolean;
  onSuccess: (res: CustomerAuthResponse) => void;
};

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

export function CustomerAuthEntry({
  title = uz.signIn,
  description = uz.authBenefitsDescription,
  showRegisterFooter = true,
  compact = false,
  onSuccess,
}: Props) {
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);

  const finishAuth = (res: CustomerAuthResponse) => {
    persistCustomerSession(res);
    onSuccess(res);
  };

  const handleTelegram = async (payload: TelegramSignedUser) => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithTelegram(payload);
      finishAuth(res);
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
      finishAuth(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label={uz.signIn} className={compact ? 'pb-2' : 'mt-6'}>
      {!compact && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        </>
      )}

      {compact && (
        <p className="mb-3 text-sm leading-5 text-zinc-500">{uz.telegramLoginHint}</p>
      )}

      <Card className={clsx('overflow-hidden border-zinc-200 p-0', compact ? 'mt-0' : 'mt-5')}>
        <div className="border-b border-zinc-100 bg-gradient-to-br from-brand-50 to-[#2AABEE]/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-[#229ED9] shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{uz.loginWithTelegram}</p>
              <p className="mt-0.5 text-xs text-zinc-600">{uz.telegramCardHint}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          {!phoneMode && (
            <div className={clsx('relative min-h-[58px] rounded-xl bg-zinc-50 p-2')}>
              {!widgetReady && (
                <div className="absolute inset-2 animate-pulse rounded-lg bg-zinc-200/80" />
              )}
              <div className={clsx('relative z-10', loading && 'pointer-events-none opacity-60')}>
                {botUsername ? (
                  <TelegramLoginButton
                    botUsername={botUsername}
                    onAuth={handleTelegram}
                    onReady={() => setWidgetReady(true)}
                  />
                ) : (
                  <Button
                    type="button"
                    className="w-full gap-2 bg-[#2AABEE] text-white hover:bg-[#229ED9]"
                    onClick={() => setPhoneMode(true)}
                  >
                    <MessageCircle size={16} />
                    {uz.loginWithTelegram}
                  </Button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <p className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {uz.signingIn}
            </p>
          )}

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <p className="relative mx-auto w-fit bg-white px-2 text-xs text-zinc-400">{uz.or}</p>
          </div>

          {phoneMode ? (
            <form onSubmit={handlePhoneLogin} className="space-y-3" aria-label={uz.loginWithPhone}>
              <label className="sr-only" htmlFor="customer-phone-login">
                {uz.phone}
              </label>
              <Input
                id="customer-phone-login"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder={uz.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? uz.signingIn : uz.signIn}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setPhoneMode(false);
                    setError('');
                  }}
                >
                  {uz.loginWithTelegram}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={() => setPhoneMode(true)}
            >
              <Phone size={16} />
              {uz.loginWithPhone}
            </Button>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </Card>

      {showRegisterFooter && (
        <p className="mt-5 text-center text-sm text-zinc-500">
          {uz.noAccount}{' '}
          <Link href="/auth/register" className="font-semibold text-brand-600">
            {uz.register}
          </Link>
        </p>
      )}
    </section>
  );
}
