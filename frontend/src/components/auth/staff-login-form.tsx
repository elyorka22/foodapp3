'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboardPath, loginStaff, setAuth } from '@/lib/auth';

type Props = {
  /** After login, go to role dashboard (default) or stay on page */
  redirect?: boolean;
  onSuccess?: () => void;
};

/**
 * Staff / admin login only — POST /api/v1/auth/login (users table).
 * Do not use for customer phone login (/customers/login).
 */
export function StaffLoginForm({ redirect = true, onSuccess }: Props) {
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
      const res = await loginStaff(loginId, password);
      setAuth(res.accessToken, res.user);
      onSuccess?.();
      if (redirect) {
        router.push(dashboardPath(res.user.role));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" id="staff-login-form" autoComplete="on">
      <Input
        type="text"
        name="staff-login-id"
        required
        placeholder="Staff email or phone"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        autoComplete="username"
      />
      <Input
        type="password"
        name="staff-password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
        <LayoutDashboard size={20} />
        {loading ? 'Signing in...' : 'Staff sign in'}
      </Button>
    </form>
  );
}
