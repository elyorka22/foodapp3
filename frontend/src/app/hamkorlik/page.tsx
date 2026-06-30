import type { Metadata } from 'next';
import { HamkorlikContent } from '@/components/marketing/hamkorlik-content';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Hamkorlik — restoranlar uchun | FoodApp',
  description:
    'FoodApp bilan hamkorlik: tayyor mijozlar oqimi, statistika, onlayn buyurtma, stol bron qilish va restoran paneli.',
  path: '/hamkorlik',
});

export default function HamkorlikPage() {
  return <HamkorlikContent />;
}
