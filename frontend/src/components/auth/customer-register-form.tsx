'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import { PasswordInput } from '@/components/ui/password-input';
import {
  persistCustomerSession,
  registerWithPhone,
  signInWithGoogle,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { GoogleSignInCancelledError } from '@/lib/firebase';
import { uz } from '@/lib/uz';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onSwitchToLogin?: () => void;
};

export function CustomerRegisterForm({ onSuccess, onSwitchToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithGoogle();
      persistCustomerSession(res);
      onSuccess(res);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError(uz.nameRequired);
      return;
    }
    if (!isValidUzPhone(phone)) {
      setError(uz.phoneInvalid);
      return;
    }
    if (password.length < 6) {
      setError(uz.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(uz.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithPhone({
        phone: normalizePhone(phone),
        fullName: fullName.trim(),
        password,
      });
      persistCustomerSession(res);
      onSuccess(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label={uz.register} className="pb-2">
      <GoogleSignInButton loading={loading} disabled={loading} onClick={handleGoogle} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
          {uz.or}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-full-name" className="mb-2 block text-sm font-medium text-foreground">
            {uz.fullName}
          </label>
          <Input
            id="register-full-name"
            type="text"
            autoComplete="name"
            placeholder={uz.fullName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-phone" className="mb-2 block text-sm font-medium text-foreground">
            {uz.phone}
          </label>
          <PhoneInput id="register-phone" value={phone} onChange={setPhone} required />
        </div>
        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-foreground">
            {uz.password}
          </label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-foreground">
            {uz.confirmPassword}
          </label>
          <PasswordInput
            id="register-confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="min-h-[52px] w-full gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uz.creatingAccount}
            </>
          ) : (
            uz.createAccount
          )}
        </Button>
      </form>

      {onSwitchToLogin ? (
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-foreground-muted"
          onClick={onSwitchToLogin}
        >
          {uz.alreadyHaveAccount}{' '}
          <span className="font-semibold text-primary">{uz.signIn}</span>
        </button>
      ) : null}
    </section>
  );
}
