import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: "Ro'yxatdan o'tish | FoodApp",
  description: "FoodApp da yangi hisob oching va tez buyurtma bering.",
  path: '/auth/register',
});

export default function AuthRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
