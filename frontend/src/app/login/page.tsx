'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy staff login URL — redirects to /staff/login */
export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/login');
  }, [router]);

  return null;
}
