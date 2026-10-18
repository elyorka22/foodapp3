'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy hero banners — redirected to Maxsus takliflar. */
export default function HomepageHeroBannersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/banners/home');
  }, [router]);
  return null;
}
