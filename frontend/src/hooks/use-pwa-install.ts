'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandalonePwa,
} from '@/lib/pwa-install';

export type PwaInstallDialogView = 'offer' | 'ios' | 'manual';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogView, setDialogView] = useState<PwaInstallDialogView>('offer');
  const [installing, setInstalling] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isStandalonePwa());
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    const onInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
      setDialogOpen(false);
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [visible]);

  const openDialog = useCallback(() => {
    setDialogView('offer');
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setInstalling(false);
  }, []);

  const confirmInstall = useCallback(async () => {
    if (isIosDevice()) {
      setDialogView('ios');
      return;
    }

    if (!deferredPrompt) {
      setDialogView('manual');
      return;
    }

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setVisible(false);
        setDialogOpen(false);
      }
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  return {
    visible,
    dialogOpen,
    dialogView,
    installing,
    openDialog,
    closeDialog,
    confirmInstall,
    canNativeInstall: deferredPrompt != null,
  };
}
