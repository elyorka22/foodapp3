'use client';

import { Button } from '@/components/ui/button';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { uz } from '@/lib/uz';

type Props = {
  open: boolean;
  featureTitle: string;
  onClose: () => void;
  onLogin: () => void;
};

export function LoginPromptSheet({ open, featureTitle, onClose, onLogin }: Props) {
  return (
    <AuthBottomSheet
      open={open}
      onClose={onClose}
      title={featureTitle}
      subtitle={uz.loginRequiredForFeature}
    >
      <Button type="button" size="lg" className="w-full" onClick={onLogin}>
        {uz.signIn}
      </Button>
      <Button type="button" variant="ghost" className="mt-2 w-full" onClick={onClose}>
        {uz.notNow}
      </Button>
    </AuthBottomSheet>
  );
}
