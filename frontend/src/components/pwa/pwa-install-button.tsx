'use client';

import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { uz } from '@/lib/uz';
import { PwaInstallDialog } from './pwa-install-dialog';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95';

type Props = {
  className?: string;
};

export function PwaInstallButton({ className }: Props) {
  const { visible, dialogOpen, dialogView, installing, openDialog, closeDialog, confirmInstall } =
    usePwaInstall();

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={uz.pwaInstallAria}
        className={className ?? iconButtonClass}
      >
        <Download size={22} strokeWidth={2} />
      </button>
      <PwaInstallDialog
        open={dialogOpen}
        view={dialogView}
        installing={installing}
        onClose={closeDialog}
        onConfirmInstall={confirmInstall}
      />
    </>
  );
}
