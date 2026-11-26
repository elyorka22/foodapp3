'use client';

import { CustomerOtpForm } from '@/components/auth/customer-otp-form';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onPending?: (res: CustomerAuthResponse | null) => void;
  onStepChange?: (step: 'phone' | 'code' | 'name') => void;
  onSwitchToLogin?: () => void;
};

export function CustomerRegisterForm({ onSuccess, onPending, onStepChange, onSwitchToLogin }: Props) {
  return (
    <section aria-label={uz.register}>
      <CustomerOtpForm
        askNameAfter
        onSuccess={onSuccess}
        onPending={onPending}
        onStepChange={onStepChange}
        phoneFooter={
          onSwitchToLogin ? (
            <button
              type="button"
              className="w-full py-1 text-center text-sm text-foreground-muted"
              onClick={onSwitchToLogin}
            >
              {uz.alreadyHaveAccount} <span className="font-semibold text-foreground">{uz.signIn}</span>
            </button>
          ) : null
        }
      />
    </section>
  );
}
