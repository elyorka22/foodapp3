'use client';

import { CustomerAuthEntry } from '@/components/auth/customer-auth-entry';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

export type AuthSheetMode = 'login' | 'register';

type Props = {
  open: boolean;
  mode: AuthSheetMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthSheetMode) => void;
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerAuthSheet({ open, mode, onClose, onSwitchMode, onSuccess }: Props) {
  const title = mode === 'login' ? uz.signIn : uz.register;

  return (
    <AuthBottomSheet open={open} onClose={onClose} title={title}>
      {mode === 'login' ? (
        <CustomerAuthEntry
          onSuccess={onSuccess}
          onSwitchToRegister={() => onSwitchMode('register')}
        />
      ) : (
        <CustomerRegisterForm
          onSuccess={onSuccess}
          onSwitchToLogin={() => onSwitchMode('login')}
        />
      )}
    </AuthBottomSheet>
  );
}
