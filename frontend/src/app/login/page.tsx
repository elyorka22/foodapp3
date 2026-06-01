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

      <div className="mt-6 space-y-3">
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Not customer login</p>
          <p className="mt-1">
            Customer login is on Profile. Staff uses email + password here (
            <code className="text-[10px]">/auth/login</code>).
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <p className="font-medium">Manager / courier / restaurant</p>
          <p className="mt-1">
            Use the <strong>email and password</strong> from Staff users. If you were logged in as
            admin, sign out first, then sign in as the new user.
          </p>
        </div>
      </div>

      <Link href="/profile" className="mt-6 text-center text-sm text-brand-600">
        ← Back to profile
      </Link>
    </main>
  );
}
