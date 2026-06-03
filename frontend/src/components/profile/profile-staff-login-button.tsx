import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  className?: string;
};

export function ProfileStaffLoginButton({ className = 'mt-6' }: Props) {
  return (
    <Link
      href="/staff/login"
      className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[15px] font-semibold text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition active:scale-[0.98] hover:bg-background ${className}`}
    >
      <LogIn size={18} strokeWidth={2} />
      {uz.staffLoginForEmployees}
    </Link>
  );
}
