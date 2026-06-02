'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerRegisterForm } from '@/components/auth/customer-register-form';
import { isCustomerLoggedIn, type CustomerProfile } from '@/lib/customer';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

export default function CustomerRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (isCustomerLoggedIn()) router.replace('/');
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
      <CustomerRegisterForm onSuccess={afterAuth} />
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/auth/login" className="font-semibold text-brand-600">
          {uz.signIn}
        </Link>
      </p>
    </main>
  );
}
