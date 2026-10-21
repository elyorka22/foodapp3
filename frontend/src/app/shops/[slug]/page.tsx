'use client';

import { useParams } from 'next/navigation';
import { StoreMenuScreen } from '@/components/store/store-menu-screen';

export default function ShopMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  return <StoreMenuScreen slug={slug} backHref="/" />;
}
