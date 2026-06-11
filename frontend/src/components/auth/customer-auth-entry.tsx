'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import { PasswordInput } from '@/components/ui/password-input';
import {
  persistCustomerSession,
  signInWithGoogle,
  signInWithPhone,
  signInWithTelegram,
  type TelegramSignedUser,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { GoogleSignInCancelledError } from '@/lib/firebase';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onSwitchToRegister?: () => void;
};

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

export function CustomerAuthEntry({ onSuccess, onSwitchToRegister }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);

  const finishAuth = (res: CustomerAuthResponse) => {
    persistCustomerSession(res);
    onSuccess(res);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithGoogle();
      finishAuth(res);
    } catch (err) {
      if (err instanceof GoogleSignInCancelledError) {
        setError(uz.googleSignInCancelled);
      } else {
        setError(err instanceof Error ? err.message : uz.googleSignInFailed);
      }
    } finally {
      setLoading(false);
    }
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
    if (!isValidUzPhone(phone)) {
      setError(uz.phoneInvalid);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await signInWithPhone(normalizePhone(phone), password);
      finishAuth(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label={uz.signIn} className="pb-2">
      <p className="text-[15px] font-semibold text-foreground">{uz.loginWithTelegram}</p>
      <div className={clsx('relative mt-3 min-h-[48px] rounded-2xl bg-[#F3F4F6] px-2 py-2')}>
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

      <div className="mt-4">
        <GoogleSignInButton loading={loading} disabled={loading} onClick={handleGoogle} />
      </div>

      {loading && (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uz.signingIn}
        </p>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          {uz.or}
        </p>
      </div>

      <form onSubmit={handlePhoneLogin} className="space-y-4" aria-label={uz.loginWithPhonePassword}>
        <div>
          <label htmlFor="customer-phone-login" className="mb-2 block text-sm font-medium text-foreground">
            {uz.phone}
          </label>
          <PhoneInput
            id="customer-phone-login"
            value={phone}
            onChange={setPhone}
            required
          />
        </div>
        <div>
          <label htmlFor="customer-password-login" className="mb-2 block text-sm font-medium text-foreground">
            {uz.password}
          </label>
          <PasswordInput
            id="customer-password-login"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="min-h-[52px] w-full" disabled={loading}>
          {loading ? uz.signingIn : uz.signIn}
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <button
          type="button"
          className="text-sm font-medium text-primary"
          onClick={() => setError(uz.forgotPasswordSoon)}
        >
          {uz.forgotPassword}
        </button>
        {onSwitchToRegister ? (
          <button
            type="button"
            className="text-sm text-foreground-muted"
            onClick={onSwitchToRegister}
          >
            {uz.noAccount}{' '}
            <span className="font-semibold text-primary">{uz.register}</span>
          </button>
        ) : null}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
