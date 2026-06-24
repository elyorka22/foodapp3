'use client';

import { useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function IosInstallHint({ open, onClose }: Props) {
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-ios-install-title"
        className="relative w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={uz.close}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 active:bg-zinc-100"
        >
          <X size={20} />
        </button>

        <h2 id="pwa-ios-install-title" className="pr-10 text-lg font-bold text-zinc-900">
          {uz.pwaIosInstallTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{uz.pwaIosInstallSubtitle}</p>

        <ol className="mt-5 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
              1
            </span>
            <p className="pt-0.5 text-[15px] leading-snug text-zinc-800">{uz.pwaIosInstallStep1}</p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
              2
            </span>
            <div className="flex min-w-0 items-start gap-2 pt-0.5">
              <Share size={18} className="mt-0.5 shrink-0 text-[#FF7A00]" aria-hidden />
              <p className="text-[15px] leading-snug text-zinc-800">{uz.pwaIosInstallStep2}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF7A00]">
              3
            </span>
            <p className="pt-0.5 text-[15px] leading-snug text-zinc-800">{uz.pwaIosInstallStep3}</p>
          </li>
        </ol>
      </div>
    </div>
  );
}
