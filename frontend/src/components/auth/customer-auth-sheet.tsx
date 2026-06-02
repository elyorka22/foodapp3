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
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerAuthSheet({ open, mode, onClose, onSuccess }: Props) {
  const title = mode === 'login' ? uz.signIn : uz.register;
  const subtitle = mode === 'login' ? uz.authSheetLoginSubtitle : uz.authSheetRegisterSubtitle;

  return (
    <AuthBottomSheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {mode === 'login' ? (
        <CustomerAuthEntry compact showRegisterFooter={false} onSuccess={onSuccess} />
      ) : (
        <CustomerRegisterForm compact onSuccess={onSuccess} />
      )}
    </AuthBottomSheet>
  );
}
