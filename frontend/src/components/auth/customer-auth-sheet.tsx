'use client';

import { useEffect, useState } from 'react';
import { CustomerAuthEntry } from '@/components/auth/customer-auth-entry';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

export type AuthSheetMode = 'login' | 'register';
type AuthStep = 'phone' | 'code' | 'name';

type Props = {
  open: boolean;
  mode: AuthSheetMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthSheetMode) => void;
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerAuthSheet({ open, mode, onClose, onSwitchMode, onSuccess }: Props) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [pending, setPending] = useState<CustomerAuthResponse | null>(null);

  useEffect(() => {
    if (open) return;
    setStep('phone');
    setPending(null);
  }, [open]);

  const title =
    step === 'code' ? uz.registerStepOtp : mode === 'login' ? uz.signIn : uz.register;

  const close = () => {
    if (pending) {
      setPending(null);
      onSuccess(pending);
      return;
    }
    setStep('phone');
    onClose();
  };

  const switchMode = (next: AuthSheetMode) => {
    setStep('phone');
    setPending(null);
    onSwitchMode(next);
  };

  return (
    <AuthBottomSheet open={open} onClose={close} title={title}>
      {mode === 'login' ? (
        <CustomerAuthEntry
          key="login"
          onSuccess={onSuccess}
          onStepChange={setStep}
          onSwitchToRegister={() => switchMode('register')}
        />
      ) : (
        <CustomerRegisterForm
          key="register"
          onSuccess={onSuccess}
          onPending={setPending}
          onStepChange={setStep}
          onSwitchToLogin={() => switchMode('login')}
        />
      )}
    </AuthBottomSheet>
  );
}
