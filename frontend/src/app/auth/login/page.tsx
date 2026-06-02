'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerNeedsPhone, isCustomerLoggedIn } from '@/lib/customer';

/** Customer login lives on Profile as a bottom sheet. */
export default function CustomerLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace(customerNeedsPhone() ? '/complete-profile' : '/profile');
      return;
    }
    router.replace('/profile');
  }, [router]);

  return null;
}
