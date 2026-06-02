'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboardPath, loginStaff, setAuth } from '@/lib/auth';
import { uz } from '@/lib/uz';

type Props = {
  redirect?: boolean;
  onSuccess?: () => void;
};

/** Staff login — POST /auth/login (users table). Phone + password only. */
export function StaffLoginForm({ redirect = true, onSuccess }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginStaff(phone, password);
      setAuth(res.accessToken, res.user);
      onSuccess?.();
      if (redirect) {
        router.replace(dashboardPath(res.user.role));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" autoComplete="on">
      <div>
        <label htmlFor="staff-phone" className="mb-2 block text-sm font-medium text-foreground">
          {uz.phone}
        </label>
        <Input
          id="staff-phone"
          type="tel"
          name="staff-phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="staff-password" className="mb-2 block text-sm font-medium text-foreground">
          {uz.password}
        </label>
        <Input
          id="staff-password"
          type="password"
          name="staff-password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="min-h-[52px] w-full" disabled={loading}>
        {loading ? uz.signingIn : uz.signIn}
      </Button>
    </form>
  );
}
