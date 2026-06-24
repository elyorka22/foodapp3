'use client';

import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { uz } from '@/lib/uz';
import { IosInstallHint } from './ios-install-hint';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95';

type Props = {
  className?: string;
};

export function PwaInstallButton({ className }: Props) {
  const { visible, iosHintOpen, install, closeIosHint } = usePwaInstall();

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        aria-label={uz.pwaInstallAria}
        className={className ?? iconButtonClass}
      >
        <Download size={22} strokeWidth={2} />
      </button>
      <IosInstallHint open={iosHintOpen} onClose={closeIosHint} />
    </>
  );
}
