import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Delete Account | FoodApp',
  description:
    'Request deletion of your FoodApp account and personal data. Google Play compliant account deletion page.',
  path: '/delete-account',
});

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
