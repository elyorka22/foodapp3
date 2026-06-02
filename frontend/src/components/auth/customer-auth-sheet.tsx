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
  const subtitle = mode === 'login' ? uz.authSheetLoginSubtitle : uz.authSheetRegisterSubtitle;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-sheet-title"
        aria-describedby="auth-sheet-desc"
        className={clsx(
          'relative z-10 mx-auto w-full max-w-lg rounded-t-[20px] bg-[#F5F5F7]',
          'max-h-[min(94vh,760px)] overflow-y-auto',
          'pb-[calc(env(safe-area-inset-bottom,0px)+12px)]',
          'shadow-[0_-12px_48px_rgba(0,0,0,0.15)]',
        )}
      >
        <div className="sticky top-0 z-10 rounded-t-[20px] bg-[#F5F5F7]/95 px-5 pb-3 pt-3 backdrop-blur-md">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <h2 id="auth-sheet-title" className="text-xl font-bold tracking-tight text-zinc-900">
                {title}
              </h2>
              <p id="auth-sheet-desc" className="mt-1.5 text-sm leading-6 text-zinc-500">
                {subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm"
              aria-label={uz.close}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2">
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
