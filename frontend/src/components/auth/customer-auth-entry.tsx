'use client';

import { CustomerOtpForm } from '@/components/auth/customer-otp-form';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onStepChange?: (step: 'phone' | 'code' | 'name') => void;
  onSwitchToRegister?: () => void;
};

export function CustomerAuthEntry({ onSuccess, onStepChange, onSwitchToRegister }: Props) {
  return (
    <section aria-label={uz.signIn}>
      <CustomerOtpForm
        onSuccess={onSuccess}
        onStepChange={onStepChange}
        phoneFooter={
          onSwitchToRegister ? (
            <button
              type="button"
              className="w-full py-1 text-center text-sm text-foreground-muted"
              onClick={onSwitchToRegister}
            >
              {uz.noAccount} <span className="font-semibold text-foreground">{uz.register}</span>
            </button>
          ) : null
        }
      />
    </section>
  );
}
