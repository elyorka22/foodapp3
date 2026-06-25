'use client';

import { useEffect } from 'react';
import { PWA_PROFILES, type PwaProfileId } from '@/lib/pwa-profiles';

export function PwaManifestLink({ profile }: { profile: PwaProfileId }) {
  const href = PWA_PROFILES[profile].manifest;

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== href) {
      link.setAttribute('href', href);
    }
  }, [href]);

  return null;
}
