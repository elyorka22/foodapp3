'use client';

import { CustomerOtpForm } from '@/components/auth/customer-otp-form';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

type Props = {
  onSuccess: (res: CustomerAuthResponse) => void;
  onSwitchToRegister?: () => void;
};

export function CustomerAuthEntry({ onSuccess, onSwitchToRegister }: Props) {
  return (
    <section aria-label={uz.signIn} className="pb-2">
      <CustomerOtpForm onSuccess={onSuccess} />
      {onSwitchToRegister ? (
        <div className="mt-4 text-center">
          <button type="button" className="text-sm text-foreground-muted" onClick={onSwitchToRegister}>
            {uz.noAccount} <span className="font-semibold text-primary">{uz.register}</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
