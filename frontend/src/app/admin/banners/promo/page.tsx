'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy promo banners — redirected to Maxsus takliflar. */
export default function HomepagePromoBannersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/banners/home');
  }, [router]);
  return null;
}
