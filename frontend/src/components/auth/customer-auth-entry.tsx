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
    <section aria-label={uz.signIn} className={compact ? 'pb-1' : 'mt-6'}>
      {!compact && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
        </>
      )}

      {!phoneMode && (
        <Card className="mt-0 overflow-hidden border-0 p-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <div className="border-b border-[#2AABEE]/10 bg-gradient-to-br from-[#E8F7FD] to-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2AABEE] text-white shadow-md shadow-[#2AABEE]/25">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-900">{uz.loginWithTelegram}</p>
                <p className="mt-0.5 text-sm text-zinc-600">{uz.telegramCardHint}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white px-5 py-5">
            <div className={clsx('relative min-h-[54px] rounded-2xl bg-zinc-50 px-2 py-2')}>
              {!widgetReady && botUsername && (
                <div className="absolute inset-2 animate-pulse rounded-xl bg-zinc-200/70" />
              )}
              <div className={clsx('relative z-10', loading && 'pointer-events-none opacity-60')}>
                {botUsername ? (
                  <TelegramLoginButton
                    botUsername={botUsername}
                    onAuth={handleTelegram}
                    onReady={() => setWidgetReady(true)}
                  />
                ) : (
                  <p className="px-2 py-3 text-center text-sm text-zinc-500">{uz.telegramNotConfigured}</p>
                )}
              </div>
            </div>

            {loading && (
              <p className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uz.signingIn}
              </p>
            )}
          </div>
        </Card>
      )}

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <p className="relative mx-auto w-fit bg-[#F5F5F7] px-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {uz.or}
        </p>
      </div>

      {phoneMode ? (
        <Card className="border-0 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <form onSubmit={handlePhoneLogin} className="space-y-4" aria-label={uz.loginWithPhone}>
            <div>
              <label htmlFor="customer-phone-login" className="mb-2 block text-sm font-medium text-zinc-700">
                {uz.phone}
              </label>
              <Input
                id="customer-phone-login"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? uz.signingIn : uz.signIn}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPhoneMode(false);
                setError('');
              }}
            >
              {uz.backToTelegram}
            </Button>
          </form>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setPhoneMode(true)}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[18px] border border-zinc-200 bg-white text-[15px] font-semibold text-zinc-800 shadow-sm active:bg-zinc-50"
        >
          <Phone size={18} className="text-zinc-600" />
          {uz.loginWithPhone}
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showRegisterFooter && !compact && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          {uz.noAccount}{' '}
          <Link href="/auth/register" className="font-semibold text-brand-600">
            {uz.register}
          </Link>
        </p>
      )}
    </section>
  );
}
