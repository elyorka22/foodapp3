import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Profil | FoodApp',
  description: 'FoodApp hisobingiz, buyurtmalar va sozlamalar.',
  path: '/profile',
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
