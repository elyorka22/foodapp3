import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: "Do'kon | FoodApp",
  description: "FoodApp do'konlari mahsulotlari.",
  path: '/shops',
});

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
