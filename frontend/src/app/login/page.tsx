'use client';

import Link from 'next/link';
import { StaffLoginForm } from '@/components/auth/staff-login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold text-brand-600">Staff Login</h1>
      <p className="mt-1 text-sm opacity-70">
        Admin, manager, restaurant, courier — <strong>users</strong> table + password
      </p>

      <div className="mt-8">
        <StaffLoginForm redirect />
      </div>

      <div className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-medium">Not customer login</p>
        <p className="mt-1">
          Phone-only login on Profile → tab &quot;Customer&quot; calls{' '}
          <code className="text-[10px]">/customers/login</code>. Staff uses{' '}
          <code className="text-[10px]">/auth/login</code> only.
        </p>
      </div>

      <Link href="/profile" className="mt-6 text-center text-sm text-brand-600">
        ← Back to profile
      </Link>
    </main>
  );
}
