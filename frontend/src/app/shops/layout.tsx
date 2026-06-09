import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: "Do'konlar | FoodApp",
  description: "FoodApp do'konlari va mahsulotlar katalogi.",
  path: '/shops',
});

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
