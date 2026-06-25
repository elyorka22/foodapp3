'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Share, X } from 'lucide-react';
import { clsx } from 'clsx';
import { colors, shadows } from '@/lib/design-tokens';
import type { PwaInstallCopy } from '@/lib/pwa-profiles';

type View = 'offer' | 'ios' | 'manual';

type Props = {
  open: boolean;
  view: View;
  copy: PwaInstallCopy;
  onClose: () => void;
  onConfirmInstall: () => void | Promise<void>;
  installing: boolean;
};

export function PwaInstallDialog({
  open,
  view,
  copy,
  onClose,
  onConfirmInstall,
  installing,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
        aria-label={copy.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className={clsx(
          'relative z-10 mx-auto flex w-full max-w-lg flex-col rounded-t-[28px] bg-white',
          'max-h-[90vh] pb-[calc(env(safe-area-inset-bottom,0px)+12px)]',
        )}
        style={{ boxShadow: shadows.sheet }}
      >
        <div className="shrink-0 px-5 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#D1D5DB]" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <h2 id="pwa-install-title" className="text-xl font-bold tracking-tight text-zinc-900">
                {view === 'ios' ? copy.iosTitle : copy.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                {view === 'ios'
                  ? copy.iosSubtitle
                  : view === 'manual'
                    ? copy.manualSubtitle
                    : copy.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-50 text-zinc-500 shadow-sm"
              aria-label={copy.close}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          {view === 'offer' ? (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="relative h-20 w-20 overflow-hidden rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <Image src={copy.iconSrc} alt={copy.appName} fill className="object-cover" unoptimized />
              </div>
              <p className="mt-4 text-[17px] font-semibold text-zinc-900">{copy.appName}</p>
              <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-zinc-500">
                {copy.description}
              </p>
            </div>
          ) : null}

          {view === 'ios' ? (
            <ol className="space-y-4 py-1">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
                  1
                </span>
                <p className="pt-0.5 text-[15px] leading-snug text-zinc-800">{copy.iosStep1}</p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
                  2
                </span>
                <div className="flex min-w-0 items-start gap-2 pt-0.5">
                  <Share size={18} className="mt-0.5 shrink-0 text-[#FF7A00]" aria-hidden />
                  <p className="text-[15px] leading-snug text-zinc-800">{copy.iosStep2}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
                  3
                </span>
                <p className="pt-0.5 text-[15px] leading-snug text-zinc-800">{copy.iosStep3}</p>
              </li>
            </ol>
          ) : null}

          {view === 'manual' ? (
            <p className="py-1 text-[15px] leading-relaxed text-zinc-700">{copy.manualHint}</p>
          ) : null}
        </div>

        <div className="shrink-0 space-y-2 px-5 pt-3">
          {view === 'offer' ? (
            <>
              <button
                type="button"
                disabled={installing}
                onClick={() => void onConfirmInstall()}
                className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF8A1F] via-[#FF7A00] to-[#FF6B00] text-[16px] font-bold text-white shadow-[0_12px_32px_rgba(255,122,0,0.35)] transition active:scale-[0.98] disabled:opacity-60"
              >
                {installing ? copy.installing : copy.confirm}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-zinc-500 active:bg-zinc-50"
              >
                {copy.cancel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-zinc-100 text-[16px] font-semibold text-zinc-800 active:scale-[0.98]"
            >
              {copy.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
