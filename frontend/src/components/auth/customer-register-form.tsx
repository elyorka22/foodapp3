'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  persistCustomerSession,
  registerWithPhone,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type Props = {
  compact?: boolean;
  onSuccess: (res: CustomerAuthResponse) => void;
};

type Step = 'phone' | 'otp' | 'name';

export function CustomerRegisterForm({ compact, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps: Step[] = ['phone', 'otp', 'name'];
  const stepIndex = steps.indexOf(step);

  const goNext = () => {
    setError('');
    if (step === 'phone') {
      if (phone.trim().length < 9) {
        setError(uz.phoneInvalid);
        return;
      }
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      if (otp.replace(/\D/g, '').length < 4) {
        setError(uz.otpInvalid);
        return;
      }
      setStep('name');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 'name') {
      goNext();
      return;
    }
    if (fullName.trim().length < 2) {
      setError(uz.nameRequired);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerWithPhone({
        phone,
        fullName: fullName.trim(),
        password: password.trim() || undefined,
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
    <section aria-label={uz.register} className={compact ? 'pb-2' : 'mt-6'}>
      {!compact && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{uz.register}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">{uz.authSheetRegisterSubtitle}</p>
        </>
      )}

      <div className="mb-5 flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={clsx(
              'h-1 flex-1 rounded-full transition-colors',
              i <= stepIndex ? 'bg-primary' : 'bg-[#E5E7EB]',
            )}
          />
        ))}
      </div>

      <Card className="border-0 p-0 shadow-card">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 p-5">
            {step === 'phone' && (
              <>
                <p className="text-sm font-medium text-foreground">{uz.registerStepPhone}</p>
                <p className="text-xs leading-5 text-foreground-muted">{uz.registerStepPhoneHint}</p>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </>
            )}

            {step === 'otp' && (
              <>
                <p className="text-sm font-medium text-foreground">{uz.registerStepOtp}</p>
                <p className="text-xs leading-5 text-foreground-muted">{uz.registerStepOtpHint}</p>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="• • • •"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.4em]"
                  required
                />
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={() => setError(uz.otpResendSoon)}
                >
                  {uz.resendCode}
                </button>
              </>
            )}

            {step === 'name' && (
              <>
                <p className="text-sm font-medium text-foreground">{uz.registerStepName}</p>
                <p className="text-xs leading-5 text-foreground-muted">{uz.registerStepNameHint}</p>
                <Input
                  type="text"
                  autoComplete="name"
                  placeholder={uz.fullName}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
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
                  />
                  <p className="mt-1.5 text-xs text-foreground-muted">{uz.passwordOptionalHint}</p>
                </div>
              </>
            )}

            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-border bg-surface p-5">
            <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uz.creatingAccount}
                </>
              ) : step === 'name' ? (
                uz.createAccount
              ) : (
                uz.continue
              )}
            </Button>

            {step !== 'phone' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setError('');
                  setStep(step === 'name' ? 'otp' : 'phone');
                }}
              >
                {uz.back}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </section>
  );
}
