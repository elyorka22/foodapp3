'use client';

import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { PWA_PROFILES, type PwaProfileId } from '@/lib/pwa-profiles';
import { PwaInstallDialog } from './pwa-install-dialog';
import { PwaManifestLink } from './pwa-manifest-link';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95';

const panelIconButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition active:scale-95 dark:border-white/10 dark:bg-zinc-900';

type Props = {
  className?: string;
  profile?: PwaProfileId;
  variant?: 'customer' | 'panel';
};

export function PwaInstallButton({ className, profile = 'customer', variant = 'customer' }: Props) {
  const copy = PWA_PROFILES[profile].copy;
  const { visible, dialogOpen, dialogView, installing, openDialog, closeDialog, confirmInstall } =
    usePwaInstall();

  if (!visible) return null;

  const buttonClass =
    className ?? (variant === 'panel' ? panelIconButtonClass : iconButtonClass);

  return (
    <>
      <PwaManifestLink profile={profile} />
      <button
        type="button"
        onClick={openDialog}
        aria-label={copy.aria}
        className={buttonClass}
      >
        <Download size={variant === 'panel' ? 20 : 22} strokeWidth={2} />
      </button>
      <PwaInstallDialog
        open={dialogOpen}
        view={dialogView}
        copy={copy}
        installing={installing}
        onClose={closeDialog}
        onConfirmInstall={confirmInstall}
      />
    </>
  );
}
