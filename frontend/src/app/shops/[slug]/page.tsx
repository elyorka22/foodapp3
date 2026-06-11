'use client';

import { useParams } from 'next/navigation';
import { BusinessMenuScreen } from '@/components/business/business-menu-screen';

export default function ShopMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  return <BusinessMenuScreen slug={slug} backHref="/" />;
}
