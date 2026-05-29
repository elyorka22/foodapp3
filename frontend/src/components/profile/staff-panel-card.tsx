'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  buildStaffLoginBody,
  clearAuth,
  dashboardPath,
  getToken,
  getUser,
  setAuth,
  StaffUser,
} from '@/lib/auth';

const PANEL_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin Panel',
  MANAGER: 'Manager Panel',
  RESTAURANT_OWNER: 'Restaurant Panel',
  RESTAURANT_STAFF: 'Restaurant Panel',
  COURIER: 'Courier Panel',
};

export function StaffPanelCard() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) setStaff(getUser());
  }, []);

  const staffLogout = () => {
    clearAuth();
    setStaff(null);
    setError('');
  };

  const staffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api<{
        accessToken: string;
        user: StaffUser;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(buildStaffLoginBody(loginId, password)),
      });
      setAuth(res.accessToken, res.user);
      setStaff(res.user);
      router.push(dashboardPath(res.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (staff) {
    const href = dashboardPath(staff.role);
    const label = PANEL_LABELS[staff.role] ?? 'Staff Panel';

    return (
      <div className="mt-6 rounded-xl border-2 border-brand-500/30 bg-brand-50 p-5 dark:border-brand-500/40 dark:bg-brand-950/40">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Staff (админка)</p>
        <p className="mt-1 font-semibold">{staff.fullName ?? staff.email}</p>
        <p className="text-xs opacity-60">{staff.role.replace(/_/g, ' ')}</p>
        <Link href={href} className="mt-4 block">
          <Button type="button" size="lg" className="w-full gap-2">
            <LayoutDashboard size={20} />
            {label}
          </Button>
        </Link>
        <button
          type="button"
          onClick={staffLogout}
          className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-red-500"
        >
          <LogOut size={16} /> Выйти из staff
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-brand-500/40 p-5">
      <p className="text-sm font-semibold text-brand-600">Вход для администратора / staff</p>
      <p className="mt-2 text-xs leading-relaxed opacity-70">
        Регистрация клиента выше — это только заказы (таблица customers). Админка — отдельный
        аккаунт в таблице users (email + пароль или телефон из seed).
      </p>

      <form onSubmit={staffLogin} className="mt-4 space-y-3">
        <Input
          type="text"
          required
          placeholder="Email или телефон staff"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          autoComplete="username"
        />
        <Input
          type="password"
          required
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          <LayoutDashboard size={20} />
          {loading ? 'Вход...' : 'Войти в админку'}
        </Button>
      </form>

      <div className="mt-4 rounded-lg bg-black/5 p-3 text-xs dark:bg-white/10">
        <p className="font-medium">После seed (пароль Admin123!):</p>
        <p className="mt-1">Email: admin@foodapp.local</p>
        <p>Телефон: +998900000001</p>
      </div>
    </div>
  );
}
