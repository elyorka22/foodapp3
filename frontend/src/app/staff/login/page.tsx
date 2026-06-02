'use client';

import Link from 'next/link';
import { StaffLoginForm } from '@/components/auth/staff-login-form';
import { uz } from '@/lib/uz';

export default function StaffLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-white px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{uz.staffLoginTitle}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{uz.staffLoginHint}</p>

      <div className="mt-8">
        <StaffLoginForm redirect />
      </div>

      <Link
        href="/profile"
        className="mt-8 block text-center text-sm text-foreground-muted hover:text-primary"
      >
        ← {uz.backToProfile}
      </Link>
    </main>
  );
}
