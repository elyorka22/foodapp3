'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { isCustomerLoggedIn } from '@/lib/customer';
import { persistCustomerSession, registerWithPhone } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCustomerLoggedIn()) router.replace('/');
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerWithPhone({
        phone,
        fullName,
        email: email.trim() || undefined,
      });
      persistCustomerSession(res);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+24px)]">
      <h1 className="text-center text-2xl font-bold text-zinc-900">{uz.register}</h1>
      <Card className="mt-8 space-y-3 p-5">
        <form onSubmit={handleRegister} className="space-y-3">
          <Input
            placeholder={uz.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            placeholder={uz.fullName}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder={uz.emailOptional}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? uz.creatingAccount : uz.createAccount}
          </Button>
        </form>
      </Card>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/auth/login" className="font-semibold text-brand-600">
          {uz.signIn}
        </Link>
      </p>
    </main>
  );
}
