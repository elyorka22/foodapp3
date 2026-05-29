'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { buildStaffLoginBody, setAuth, dashboardPath } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api<{
        accessToken: string;
        user: { id: string; email: string; fullName?: string; role: string };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(buildStaffLoginBody(loginId, password)),
      });
      setAuth(res.accessToken, res.user);
      router.push(dashboardPath(res.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold text-brand-600">Staff Login</h1>
      <p className="mt-1 text-sm opacity-70">Email или телефон из таблицы users + пароль</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          type="text"
          required
          placeholder="Email или телефон"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <Input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-6 rounded-lg bg-black/5 p-3 text-xs dark:bg-white/10">
        <p className="font-medium">Demo Super Admin (после seed):</p>
        <p>admin@foodapp.local / +998900000001</p>
        <p>Пароль: Admin123!</p>
      </div>
      <Link href="/profile" className="mt-4 text-center text-sm text-brand-600">
        ← Назад в профиль
      </Link>
    </main>
  );
}
