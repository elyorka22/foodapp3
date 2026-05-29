'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, UserCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { clearCustomer, getCustomer, setCustomer } from '@/lib/customer';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import { clsx } from 'clsx';

type ProfileTab = 'customer' | 'staff';

type CustomerResponse = {
  customer: {
    id: string;
    phone: string;
    fullName: string;
    email?: string;
    referralCode?: string;
    loyalty?: { points: number; level: string };
  };
};

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex-1 rounded-xl py-3 text-sm font-semibold transition active:scale-[0.98]',
        active
          ? 'bg-white text-zinc-900 shadow-card dark:bg-zinc-800 dark:text-white'
          : 'text-zinc-500 dark:text-zinc-400',
      )}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const [customer, setCustomerState] = useState(getCustomer);
  const [pageTab, setPageTab] = useState<ProfileTab>('customer');
  const [customerTab, setCustomerTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api<CustomerResponse>('/customers/register', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          fullName,
          email: email.trim() || undefined,
          referredByCode: referredByCode.trim() || undefined,
        }),
      });
      setCustomer(res.customer);
      setCustomerState(res.customer);
      const refMsg = res.customer.referralCode
        ? ` Your referral code: ${res.customer.referralCode}`
        : '';
      setMessage(`Welcome! Your account is ready.${refMsg}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api<CustomerResponse>('/customers/login', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setCustomer(res.customer);
      setCustomerState(res.customer);
      setMessage(`Welcome back, ${res.customer.fullName}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logoutCustomer = () => {
    clearCustomer();
    setCustomerState(null);
    setPhone('');
    setFullName('');
    setEmail('');
    setMessage('You have been signed out.');
    setError('');
  };

  if (customer) {
    return (
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Profile</h1>

        <Card className="mt-6 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50">
              <UserCircle size={32} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Customer</p>
              <p className="truncate text-lg font-bold text-zinc-900 dark:text-white">
                {customer.fullName}
              </p>
              <p className="text-sm text-zinc-500">{customer.phone}</p>
            </div>
          </div>
          {customer.email && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{customer.email}</p>
          )}
          {customer.referralCode && (
            <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500">Your referral code</p>
              <p className="font-mono text-base font-semibold text-brand-600">{customer.referralCode}</p>
            </div>
          )}
          {customer.loyalty && (
            <p className="mt-3 text-sm text-zinc-600">
              Loyalty · <span className="font-medium">{customer.loyalty.level}</span> ·{' '}
              {customer.loyalty.points} pts
            </p>
          )}
          <Button type="button" variant="secondary" className="mt-5 w-full gap-2" onClick={logoutCustomer}>
            <LogOut size={18} />
            Sign out
          </Button>
        </Card>

        <StaffPanelCard />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">Save your phone for faster checkout and order history</p>

      <div className="mt-6 flex gap-2 rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-900">
        <TabButton
          active={pageTab === 'customer'}
          onClick={() => {
            setPageTab('customer');
            setError('');
            setMessage('');
          }}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <UserCircle size={16} />
            Customer
          </span>
        </TabButton>
        <TabButton
          active={pageTab === 'staff'}
          onClick={() => {
            setPageTab('staff');
            setError('');
            setMessage('');
          }}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Users size={16} />
            Staff
          </span>
        </TabButton>
      </div>

      {pageTab === 'customer' ? (
        <Card className="mt-6 p-5">
          <div className="flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
            <button
              type="button"
              className={clsx(
                'flex-1 rounded-lg py-2 text-sm font-medium transition',
                customerTab === 'login' && 'bg-white shadow-sm dark:bg-zinc-700',
              )}
              onClick={() => setCustomerTab('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={clsx(
                'flex-1 rounded-lg py-2 text-sm font-medium transition',
                customerTab === 'register' && 'bg-white shadow-sm dark:bg-zinc-700',
              )}
              onClick={() => setCustomerTab('register')}
            >
              Register
            </button>
          </div>

          {customerTab === 'login' ? (
            <form onSubmit={handleCustomerLogin} className="mt-5 space-y-4">
              <Input
                type="tel"
                required
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <Input
                type="text"
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                type="tel"
                required
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Friend's referral code (optional)"
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        <StaffPanelCard />
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          {message}
        </p>
      )}

      {pageTab === 'customer' && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Platform admin?{' '}
          <button
            type="button"
            className="font-semibold text-brand-600 active:opacity-70"
            onClick={() => setPageTab('staff')}
          >
            Open staff login
          </button>
        </p>
      )}
    </main>
  );
}
