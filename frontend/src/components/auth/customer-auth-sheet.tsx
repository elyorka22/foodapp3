'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { CustomerAuthEntry } from '@/components/auth/customer-auth-entry';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

export type AuthSheetMode = 'login' | 'register';

type Props = {
  open: boolean;
  mode: AuthSheetMode;
  onClose: () => void;
  onSuccess: (res: CustomerAuthResponse) => void;
};

export function CustomerAuthSheet({ open, mode, onClose, onSuccess }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = mode === 'login' ? uz.signIn : uz.register;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-sheet-title"
        className={clsx(
          'relative z-10 mx-auto w-full max-w-lg rounded-t-3xl border border-zinc-100 bg-white shadow-2xl',
          'max-h-[min(92vh,720px)] overflow-y-auto',
          'pb-[calc(env(safe-area-inset-bottom,0px)+16px)]',
          'transition-transform',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
          <h2 id="auth-sheet-title" className="text-base font-semibold text-zinc-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label={uz.close}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-2">
          {mode === 'login' ? (
            <CustomerAuthEntry compact showRegisterFooter={false} onSuccess={onSuccess} />
          ) : (
            <CustomerRegisterForm compact onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
