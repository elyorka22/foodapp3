'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { clearCustomer, getCustomer, setCustomer } from '@/lib/customer';

type Tab = 'login' | 'register';

type CustomerResponse = {
  customer: { id: string; phone: string; fullName: string; email?: string };
};

export default function ProfilePage() {
  const [customer, setCustomerState] = useState(getCustomer);
  const [tab, setTab] = useState<Tab>('login');
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
      setMessage('Registration successful! Data saved to database.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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

  const logout = () => {
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
          <p className="text-lg font-semibold">{customer.fullName}</p>
          <p className="mt-1 text-sm opacity-70">{customer.phone}</p>
          {customer.email && <p className="text-sm opacity-70">{customer.email}</p>}
          <p className="mt-2 text-xs opacity-50">ID: {customer.id}</p>
          <p className="mt-3 text-xs text-green-600 dark:text-green-400">
            Account saved in database
          </p>
          <Button type="button" variant="secondary" className="mt-4" onClick={logout}>
            Log out
          </Button>
        </div>

        <div className="mt-8 border-t pt-6 dark:border-white/10">
          <p className="text-sm opacity-70">Restaurant staff or courier?</p>
          <Link href="/login" className="mt-2 inline-block font-medium text-brand-600">
            Staff login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Profile</h1>
      <p className="mt-1 text-sm opacity-70">Register — data will be saved to the server</p>

      <div className="mt-4 flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === 'login' ? 'bg-white shadow dark:bg-zinc-800' : ''}`}
          onClick={() => setTab('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === 'register' ? 'bg-white shadow dark:bg-zinc-800' : ''}`}
          onClick={() => setTab('register')}
        >
          Register
        </button>
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            type="tel"
            required
            placeholder="Phone (+998901234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Loading...' : 'Log in'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
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
            placeholder="Phone (+998901234567)"
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

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {message && <p className="mt-4 text-sm text-brand-600">{message}</p>}

      <div className="mt-8 border-t pt-6 dark:border-white/10">
        <p className="text-sm opacity-70">Work here?</p>
        <Link href="/login" className="mt-2 inline-block font-medium text-brand-600">
          Staff login →
        </Link>
      </div>
    </main>
  );
}
