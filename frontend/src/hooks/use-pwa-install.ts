'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandalonePwa,
} from '@/lib/pwa-install';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHintOpen, setIosHintOpen] = useState(false);
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
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [visible]);

  const install = useCallback(async () => {
    if (isIosDevice()) {
      setIosHintOpen(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setVisible(false);
    }
  }, [deferredPrompt]);

  const closeIosHint = useCallback(() => setIosHintOpen(false), []);

  return {
    visible,
    iosHintOpen,
    install,
    closeIosHint,
    canNativeInstall: deferredPrompt != null,
  };
}
