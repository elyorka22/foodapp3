'use client';

import { useState } from 'react';
import { LogOut, UserCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { clearCustomer, getCustomer, setCustomer } from '@/lib/customer';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import { uz } from '@/lib/uz';
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
          ? 'bg-white text-zinc-900 shadow-card'
          : 'text-zinc-500',
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
        ? ` ${uz.referralCode(res.customer.referralCode)}`
        : '';
      setMessage(`${uz.welcomeRegistered}${refMsg}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.registrationFailed);
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
      setMessage(uz.welcome(res.customer.fullName));
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.loginFailed);
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
    setMessage(uz.loggedOut);
    setError('');
  };

  if (customer) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{uz.profile}</h1>

        <Card className="mt-6 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <UserCircle size={32} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {uz.customer}
              </p>
              <p className="truncate text-lg font-bold text-zinc-900">{customer.fullName}</p>
              <p className="text-sm text-zinc-500">{customer.phone}</p>
            </div>
          </div>
          {customer.email && <p className="mt-3 text-sm text-zinc-600">{customer.email}</p>}
          {customer.referralCode && (
            <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">{uz.yourReferral}</p>
              <p className="font-mono text-base font-semibold text-brand-600">
                {customer.referralCode}
              </p>
            </div>
          )}
          {customer.loyalty && (
            <p className="mt-3 text-sm text-zinc-600">
              {uz.loyalty(customer.loyalty.level, customer.loyalty.points)}
            </p>
          )}
          <Button type="button" variant="secondary" className="mt-5 w-full gap-2" onClick={logoutCustomer}>
            <LogOut size={18} />
            {uz.signOut}
          </Button>
        </Card>

        <StaffPanelCard />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{uz.profile}</h1>
      <p className="mt-1 text-sm text-zinc-500">{uz.profileHint}</p>

      <div className="mt-6 flex gap-2 rounded-2xl bg-zinc-100 p-1.5">
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
            {uz.customer}
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
            {uz.staff}
          </span>
        </TabButton>
      </div>

      {pageTab === 'customer' ? (
        <Card className="mt-6 p-5">
          <div className="flex gap-2 rounded-xl bg-zinc-100 p-1">
            <button
              type="button"
              className={clsx(
                'flex-1 rounded-lg py-2 text-sm font-medium transition',
                customerTab === 'login' && 'bg-white shadow-sm',
              )}
              onClick={() => setCustomerTab('login')}
            >
              {uz.signIn}
            </button>
            <button
              type="button"
              className={clsx(
                'flex-1 rounded-lg py-2 text-sm font-medium transition',
                customerTab === 'register' && 'bg-white shadow-sm',
              )}
              onClick={() => setCustomerTab('register')}
            >
              {uz.register}
            </button>
          </div>

          {customerTab === 'login' ? (
            <form onSubmit={handleCustomerLogin} className="mt-5 space-y-4">
              <Input
                type="tel"
                required
                placeholder={uz.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? uz.signingIn : uz.signIn}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <Input
                type="text"
                required
                placeholder={uz.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                type="tel"
                required
                placeholder={uz.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                type="email"
                placeholder={uz.emailOptional}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder={uz.referralOptional}
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? uz.creatingAccount : uz.createAccount}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        <StaffPanelCard />
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>
      )}

      {pageTab === 'customer' && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          {uz.platformAdmin}{' '}
          <button
            type="button"
            className="font-semibold text-brand-600 active:opacity-70"
            onClick={() => setPageTab('staff')}
          >
            {uz.openStaffLogin}
          </button>
        </p>
      )}
    </main>
  );
}
