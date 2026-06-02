'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isCustomerLoggedIn } from '@/lib/customer';

/** Customer registration lives on Profile as a bottom sheet. */
export default function CustomerRegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isCustomerLoggedIn() ? '/profile' : '/profile');
  }, [router]);

  return null;
}
