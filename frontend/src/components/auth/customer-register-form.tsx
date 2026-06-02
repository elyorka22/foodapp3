'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  persistCustomerSession,
  registerWithPhone,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError(uz.nameRequired);
      return;
    }
    if (phone.trim().length < 9) {
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
        phone,
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
          <Input
            id="register-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-foreground">
            {uz.password}
          </label>
          <Input
            id="register-password"
            type="password"
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
          <Input
            id="register-confirm-password"
            type="password"
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
