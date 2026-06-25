import { Suspense } from 'react';
import { StaffLoginContent } from './staff-login-content';
import { uz } from '@/lib/uz';

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 text-sm text-foreground-muted">
          {uz.loading}
        </main>
      }
    >
      <StaffLoginContent />
    </Suspense>
  );
}
