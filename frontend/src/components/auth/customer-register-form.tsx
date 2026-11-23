'use client';

import { CustomerOtpForm } from '@/components/auth/customer-otp-form';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onSwitchToLogin?: () => void;
};

export function CustomerRegisterForm({ onSuccess, onSwitchToLogin }: Props) {
  return (
    <section aria-label={uz.register} className="pb-2">
      <CustomerOtpForm requireName onSuccess={onSuccess} />
      {onSwitchToLogin ? (
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-foreground-muted"
          onClick={onSwitchToLogin}
        >
          {uz.alreadyHaveAccount} <span className="font-semibold text-primary">{uz.signIn}</span>
        </button>
      ) : null}
    </section>
  );
}
