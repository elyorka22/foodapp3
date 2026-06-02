'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uz } from '@/lib/uz';

type Props = {
  open: boolean;
  featureTitle: string;
  onClose: () => void;
  onLogin: () => void;
};

export function LoginPromptSheet({ open, featureTitle, onClose, onLogin }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/45 backdrop-blur-[2px]"
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 mx-auto w-full max-w-lg rounded-t-[20px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-5 shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-zinc-900">{featureTitle}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{uz.loginRequiredForFeature}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
            aria-label={uz.close}
          >
            <X size={18} />
          </button>
        </div>
        <Button type="button" size="lg" className="mt-5 w-full" onClick={onLogin}>
          {uz.signIn}
        </Button>
        <Button type="button" variant="ghost" className="mt-2 w-full" onClick={onClose}>
          {uz.notNow}
        </Button>
      </div>
    </div>
  );
}
