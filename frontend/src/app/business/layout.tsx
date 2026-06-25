import type { Metadata } from 'next';
import { PwaManifestLink } from '@/components/pwa/pwa-manifest-link';

export const metadata: Metadata = {
  title: 'Restoran paneli | FoodApp',
  manifest: '/manifest-business.json',
  robots: { index: false, follow: false },
};

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaManifestLink profile="business" />
      {children}
    </>
  );
}
