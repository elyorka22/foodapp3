'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StaffLoginForm } from '@/components/auth/staff-login-form';
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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);

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
      const res = await signInWithPhone(phone, password);
      finishAuth(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  if (staffOpen) {
    return (
      <section aria-label={uz.staffLoginTitle} className={compact ? 'pb-2' : 'mt-6'}>
        <button
          type="button"
          className="mb-4 text-sm font-medium text-primary"
          onClick={() => {
            setStaffOpen(false);
            setError('');
          }}
        >
          ← {uz.backToCustomerLogin}
        </button>
        <Card className="p-5 shadow-card">
          <p className="text-base font-semibold text-foreground">{uz.staffLoginTitle}</p>
          <p className="mt-1 text-sm text-foreground-muted">{uz.staffLoginHint}</p>
          <div className="mt-4">
            <StaffLoginForm redirect onSuccess={() => setStaffOpen(false)} />
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section aria-label={uz.signIn} className={compact ? 'pb-2' : 'mt-6'}>
      {!compact && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">{description}</p>
        </>
      )}

      {/* Section 1: Telegram */}
      <Card className="mt-0 overflow-hidden border-0 p-0 shadow-card">
        <div className="border-b border-[#D4EEF9] bg-[#E8F7FD] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2AABEE] text-white shadow-[0_4px_12px_rgba(42,171,238,0.25)]">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{uz.loginWithTelegram}</p>
              <p className="mt-0.5 text-sm text-foreground-muted">{uz.telegramCardHint}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-surface px-5 py-5">
          <div className={clsx('relative min-h-[54px] rounded-2xl bg-background px-2 py-2')}>
            {!widgetReady && botUsername && (
              <div className="absolute inset-2 animate-pulse rounded-xl bg-[#E5E7EB]" />
            )}
            <div className={clsx('relative z-10', loading && 'pointer-events-none opacity-60')}>
              {botUsername ? (
                <TelegramLoginButton
                  botUsername={botUsername}
                  onAuth={handleTelegram}
                  onReady={() => setWidgetReady(true)}
                />
              ) : (
                <p className="px-2 py-3 text-center text-sm text-foreground-muted">
                  {uz.telegramNotConfigured}
                </p>
              )}
            </div>
          </div>

          {loading && (
            <p className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uz.signingIn}
            </p>
          )}
        </div>
      </Card>

      {/* Section 2: Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-background px-3 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          {uz.or}
        </p>
      </div>

      {/* Section 3: Phone + password */}
      <Card className="border-0 p-5 shadow-card">
        <form onSubmit={handlePhoneLogin} className="space-y-4" aria-label={uz.loginWithPhonePassword}>
          <div>
            <label htmlFor="customer-phone-login" className="mb-2 block text-sm font-medium text-foreground">
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
          <div>
            <label htmlFor="customer-password-login" className="mb-2 block text-sm font-medium text-foreground">
              {uz.password}
            </label>
            <Input
              id="customer-password-login"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-foreground-muted">{uz.passwordOptionalHint}</p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-primary"
            onClick={() => setError(uz.forgotPasswordSoon)}
          >
            {uz.forgotPassword}
          </button>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? uz.signingIn : uz.signIn}
          </Button>
        </form>
      </Card>

      {/* Section 4: Employee login */}
      <button
        type="button"
        onClick={() => setStaffOpen(true)}
        className="mt-5 w-full py-2 text-center text-sm font-medium text-foreground-muted underline-offset-2 hover:text-primary hover:underline"
      >
        {uz.staffLoginForEmployees}
      </button>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showRegisterFooter && !compact && (
        <p className="mt-6 text-center text-sm text-foreground-muted">
          {uz.noAccount}{' '}
          <Link href="/auth/register" className="font-semibold text-primary">
            {uz.register}
          </Link>
        </p>
      )}
    </section>
  );
}
