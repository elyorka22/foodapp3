'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { clearCustomer, getCustomer, setCustomer } from '@/lib/customer';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';

type ProfileTab = 'customer' | 'staff';

type CustomerResponse = {
  customer: { id: string; phone: string; fullName: string; email?: string };
};

export default function ProfilePage() {
  const [customer, setCustomerState] = useState(getCustomer);
  const [pageTab, setPageTab] = useState<ProfileTab>('customer');
  const [customerTab, setCustomerTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
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
        }),
      });
      setCustomer(res.customer);
      setCustomerState(res.customer);
      setMessage('Registration saved (customers table).');
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
      setMessage(`Welcome, ${res.customer.fullName}!`);
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
    setMessage('Logged out');
    setError('');
  };

  if (customer) {
    return (
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="mt-6 rounded-xl border p-5 dark:border-white/10">
          <p className="text-xs font-medium text-zinc-500">Customer account (customers table)</p>
          <p className="mt-2 text-lg font-semibold">{customer.fullName}</p>
          <p className="text-sm opacity-70">{customer.phone}</p>
          {customer.email && <p className="text-sm opacity-70">{customer.email}</p>}
          <Button type="button" variant="secondary" className="mt-4" onClick={logoutCustomer}>
            Log out (customer)
          </Button>
        </div>
        <StaffPanelCard />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Profile</h1>

      <div className="mt-4 flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${pageTab === 'customer' ? 'bg-white shadow dark:bg-zinc-800' : ''}`}
          onClick={() => {
            setPageTab('customer');
            setError('');
            setMessage('');
          }}
        >
          Customer
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${pageTab === 'staff' ? 'bg-brand-600 text-white shadow' : ''}`}
          onClick={() => {
            setPageTab('staff');
            setError('');
            setMessage('');
          }}
        >
          Staff / Admin
        </button>
      </div>

      {pageTab === 'customer' ? (
        <div className="mt-6">
          <p className="text-sm opacity-70">Orders only — phone + name → POST /customers/*</p>

          <div className="mt-4 flex gap-2 rounded-lg bg-black/5 p-1 dark:bg-white/10">
            <button
              type="button"
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${customerTab === 'login' ? 'bg-white dark:bg-zinc-800' : ''}`}
              onClick={() => setCustomerTab('login')}
            >
              Customer login
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-1.5 text-xs font-medium ${customerTab === 'register' ? 'bg-white dark:bg-zinc-800' : ''}`}
              onClick={() => setCustomerTab('register')}
            >
              Register
            </button>
          </div>

          {customerTab === 'login' ? (
            <form id="customer-login-form" onSubmit={handleCustomerLogin} className="mt-4 space-y-4">
              <Input
                type="tel"
                required
                placeholder="Phone only (no password)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Loading...' : 'Customer log in'}
              </Button>
            </form>
          ) : (
            <form id="customer-register-form" onSubmit={handleRegister} className="mt-4 space-y-4">
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
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Saving...' : 'Register'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <StaffPanelCard />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {message && <p className="mt-4 text-sm text-brand-600">{message}</p>}

      {pageTab === 'customer' && (
        <p className="mt-6 text-center text-sm">
          <button type="button" className="text-brand-600 underline" onClick={() => setPageTab('staff')}>
            Super Admin? Switch to Staff / Admin tab →
          </button>
        </p>
      )}
    </main>
  );
}
