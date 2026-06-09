import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Kirish | FoodApp',
  description: 'FoodApp akkauntingizga kiring — telefon, Telegram yoki Google orqali.',
  path: '/auth/login',
});

export default function AuthLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
