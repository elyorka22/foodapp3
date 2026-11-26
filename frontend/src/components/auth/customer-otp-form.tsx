'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import {
  persistCustomerSession,
  requestCustomerOtp,
  updateCustomerName,
  verifyCustomerOtp,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { getCustomerToken } from '@/lib/customer';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type Step = 'phone' | 'code' | 'name';

type Props = {
  askNameAfter?: boolean;
  onSuccess: (res: CustomerAuthResponse) => void;
  onPending?: (res: CustomerAuthResponse | null) => void;
  onStepChange?: (step: Step) => void;
  phoneFooter?: ReactNode;
};

const DEFAULT_NAME = 'Mijoz';

function prettyPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('998') ? digits.slice(3, 12) : digits.slice(0, 9);
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(' ')}`;
}

export function CustomerOtpForm({
  askNameAfter,
  onSuccess,
  onPending,
  onStepChange,
  phoneFooter,
}: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [session, setSession] = useState<CustomerAuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const codeInput = useRef<HTMLInputElement>(null);

  const go = (next: Step) => {
    setStep(next);
    onStepChange?.(next);
  };

  const sendCode = async () => {
    setError('');
    if (!isValidUzPhone(phone)) {
      setError(uz.phoneInvalid);
      return;
    }
    setLoading(true);
    try {
      await requestCustomerOtp(normalizePhone(phone));
      go('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.otpSendFailed);
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(code.trim())) {
      setError(uz.otpInvalid);
      return;
    }
    setLoading(true);
    try {
      const res = await verifyCustomerOtp({
        phone: normalizePhone(phone),
        code: code.trim(),
      });
      persistCustomerSession(res);
      const needsName =
        askNameAfter &&
        (res.user.fullName.trim() === '' || res.user.fullName.trim() === DEFAULT_NAME);
      if (needsName) {
        setSession(res);
        onPending?.(res);
        go('name');
        return;
      }
      onSuccess(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.otpInvalid);
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!session) return;
    setError('');
    if (fullName.trim().length < 2) {
      setError(uz.nameRequired);
      return;
    }
    setLoading(true);
    try {
      const token = getCustomerToken();
      if (!token) {
        onPending?.(null);
        onSuccess(session);
        return;
      }
      const res = await updateCustomerName(fullName.trim(), token);
      persistCustomerSession(res);
      onPending?.(null);
      onSuccess(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.nameRequired);
    } finally {
      setLoading(false);
    }
  };

  const skipName = () => {
    if (!session) return;
    onPending?.(null);
    onSuccess(session);
  };

  return (
    <div>
      {step === 'phone' ? (
        <div className="space-y-5">
          <p className="text-[15px] leading-6 text-foreground-muted">{uz.registerStepPhoneHint}</p>
          <PhoneInput id="otp-phone" value={phone} onChange={setPhone} required />
          {error ? <ErrorText text={error} /> : null}
          <Button type="button" size="lg" className="w-full" disabled={loading} onClick={sendCode}>
            {loading ? uz.signingIn : uz.sendCode}
          </Button>
          {phoneFooter}
        </div>
      ) : null}

      {step === 'code' ? (
        <form onSubmit={confirmCode} className="space-y-5">
          <div>
            <p className="text-[15px] leading-6 text-foreground-muted">{uz.registerStepOtpHint}</p>
            <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
              {prettyPhone(phone)}
            </p>
          </div>
          <div
            className="relative"
            onClick={() => codeInput.current?.focus()}
          >
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={clsx(
                    'flex h-16 flex-1 items-center justify-center rounded-2xl border text-2xl font-semibold',
                    code.length === index
                      ? 'border-zinc-900 bg-white'
                      : 'border-zinc-200 bg-zinc-50',
                  )}
                >
                  {code[index] ?? ''}
                </span>
              ))}
            </div>
            <input
              ref={codeInput}
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="absolute inset-0 cursor-text opacity-0"
              aria-label={uz.registerStepOtp}
            />
          </div>
          {error ? <ErrorText text={error} /> : null}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? uz.signingIn : uz.continue}
          </Button>
          <Button type="button" variant="secondary" className="w-full" disabled={loading} onClick={sendCode}>
            {uz.resendCode}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setError('');
              setCode('');
              go('phone');
            }}
          >
            {uz.back}
          </Button>
        </form>
      ) : null}

      {step === 'name' && session ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/45" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="name-dialog-title"
            className="relative z-10 w-full max-w-lg rounded-t-[28px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-6 shadow-xl sm:mx-4 sm:rounded-[28px] sm:pb-6"
          >
            <h2 id="name-dialog-title" className="text-xl font-bold tracking-tight text-foreground">
              {uz.registerStepName}
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-foreground-muted">{uz.registerStepNameHint}</p>
            <div className="mt-5">
              <Input
                id="otp-full-name"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder={uz.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            {error ? (
              <div className="mt-3">
                <ErrorText text={error} />
              </div>
            ) : null}
            <Button type="button" size="lg" className="mt-5 w-full" disabled={loading} onClick={saveName}>
              {loading ? uz.signingIn : uz.saveName}
            </Button>
            <button
              type="button"
              className="mt-2 w-full py-3 text-sm font-semibold text-foreground-muted"
              disabled={loading}
              onClick={skipName}
            >
              {uz.skip}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
      {text}
    </p>
  );
}
