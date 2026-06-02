'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAuthEntry } from '@/components/auth/customer-auth-entry';
import {
  customerNeedsPhone,
  isCustomerLoggedIn,
  type CustomerProfile,
} from '@/lib/customer';
import type { CustomerAuthResponse } from '@/lib/customer-auth';

export default function CustomerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      router.replace(customerNeedsPhone() ? '/complete-profile' : '/');
    }
  }, [router]);

  const afterAuth = useCallback((res: CustomerAuthResponse) => {
    const user = res.user as CustomerProfile;
    if (user.needsPhone || !user.phone) {
      router.replace('/complete-profile');
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <CustomerAuthEntry onSuccess={afterAuth} />
    </main>
  );
}
