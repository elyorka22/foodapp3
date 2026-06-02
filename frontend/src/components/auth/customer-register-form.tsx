'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  persistCustomerSession,
  registerWithPhone,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  compact?: boolean;
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerRegisterForm({ compact, onSuccess }: Props) {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerWithPhone({
        phone,
        fullName,
        email: email.trim() || undefined,
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
    <section aria-label={uz.register} className={compact ? '' : 'mt-6'}>
      {!compact && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{uz.register}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{uz.authBenefitsDescription}</p>
        </>
      )}

      <form onSubmit={handleRegister} className="mt-4 space-y-3">
        <label className="sr-only" htmlFor="register-full-name">
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
        <label className="sr-only" htmlFor="register-phone">
          {uz.phone}
        </label>
        <Input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder={uz.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <label className="sr-only" htmlFor="register-email">
          {uz.emailOptional}
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder={uz.emailOptional}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? uz.creatingAccount : uz.createAccount}
        </Button>
      </form>
    </section>
  );
}
