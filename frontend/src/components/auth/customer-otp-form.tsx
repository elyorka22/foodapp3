'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import {
  persistCustomerSession,
  requestCustomerOtp,
  verifyCustomerOtp,
  type CustomerAuthResponse,
} from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  requireName?: boolean;
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerOtpForm({ requireName, onSuccess }: Props) {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    setError('');
    if (requireName && fullName.trim().length < 2) {
      setError(uz.nameRequired);
      return;
    }
    if (!isValidUzPhone(phone)) {
      setError(uz.phoneInvalid);
      return;
    }
    setLoading(true);
    try {
      await requestCustomerOtp(normalizePhone(phone));
      setCodeSent(true);
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
        fullName: fullName.trim() || undefined,
      });
      persistCustomerSession(res);
      onSuccess(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.otpInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={confirmCode} className="space-y-4">
      {requireName ? (
        <div>
          <label htmlFor="otp-full-name" className="mb-2 block text-sm font-medium text-foreground">
            {uz.fullName}
          </label>
          <Input
            id="otp-full-name"
            type="text"
            autoComplete="name"
            placeholder={uz.fullName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={codeSent}
            required
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="otp-phone" className="mb-2 block text-sm font-medium text-foreground">
          {uz.phone}
        </label>
        <PhoneInput
          id="otp-phone"
          value={phone}
          onChange={setPhone}
          disabled={codeSent}
          required
        />
        <p className="mt-2 text-xs text-foreground-muted">{uz.registerStepPhoneHint}</p>
      </div>

      {codeSent ? (
        <div>
          <label htmlFor="otp-code" className="mb-2 block text-sm font-medium text-foreground">
            {uz.registerStepOtp}
          </label>
          <Input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            placeholder="1234"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
          />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {codeSent ? (
        <div className="space-y-2">
          <Button type="submit" size="lg" className="min-h-[52px] w-full" disabled={loading}>
            {loading ? uz.signingIn : uz.continue}
          </Button>
          <button
            type="button"
            className="w-full text-sm font-medium text-primary"
            disabled={loading}
            onClick={sendCode}
          >
            {uz.resendCode}
          </button>
        </div>
      ) : (
        <Button
          type="button"
          size="lg"
          className="min-h-[52px] w-full"
          disabled={loading}
          onClick={sendCode}
        >
          {loading ? uz.signingIn : uz.sendCode}
        </Button>
      )}
    </form>
  );
}
