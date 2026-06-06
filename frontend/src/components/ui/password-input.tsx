'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/input';
import { uz } from '@/lib/uz';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput({ className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={clsx('pr-12', className)}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-foreground-muted transition hover:text-foreground"
        aria-label={visible ? uz.hidePassword : uz.showPassword}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
      </button>
    </div>
  );
}
