'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, MessageCircle, UserCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  clearCustomer,
  customerNeedsPhone,
  getCustomer,
  getCustomerToken,
  setCustomerAuth,
  type CustomerProfile,
} from '@/lib/customer';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import { uz } from '@/lib/uz';
import { clsx } from 'clsx';

type ProfileTab = 'customer' | 'staff';

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
        active ? 'bg-white text-zinc-900 shadow-card' : 'text-zinc-500',
      )}
    >
      {children}
    </button>
  );
}

function displayTelegramName(c: CustomerProfile): string {
  if (c.telegramFirstName) {
    return [c.telegramFirstName, c.telegramLastName].filter(Boolean).join(' ');
  }
  return c.fullName;
}

export default function ProfilePage() {
  const [customer, setCustomerState] = useState<CustomerProfile | null>(null);
  const [pageTab, setPageTab] = useState<ProfileTab>('customer');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const local = getCustomer();
    setCustomerState(local);
    const token = getCustomerToken();
    if (!token) return;
    api<{ user: CustomerProfile }>('/customers/me', { token })
      .then((res) => {
        setCustomerAuth(token, res.user);
        setCustomerState(res.user);
      })
      .catch(() => {});
  }, []);

  const logoutCustomer = () => {
    clearCustomer();
    setCustomerState(null);
    setMessage(uz.loggedOut);
  };

  if (pageTab === 'customer' && customer) {
    const tgName = displayTelegramName(customer);
    const showTelegram = customer.isTelegramVerified || customer.telegramId;

    return (
      <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{uz.profile}</h1>

        {customerNeedsPhone() && (
          <Card className="mt-4 border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">{uz.phoneRequiredForOrders}</p>
            <Link href="/complete-profile" className="mt-3 inline-block">
              <Button type="button" size="sm">
                {uz.addPhone}
              </Button>
            </Link>
          </Card>
        )}

        <Card className="mt-6 p-5">
          <div className="flex items-center gap-4">
            {customer.telegramPhotoUrl ? (
              <Image
                src={customer.telegramPhotoUrl}
                alt={tgName}
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <UserCircle size={32} strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {uz.customer}
              </p>
              <p className="truncate text-lg font-bold text-zinc-900">{customer.fullName}</p>
              {customer.phone ? (
                <p className="text-sm text-zinc-500">{customer.phone}</p>
              ) : (
                <p className="text-sm text-amber-600">{uz.phoneRequiredForOrders}</p>
              )}
            </div>
          </div>

          {showTelegram && (
            <div className="mt-4 rounded-xl bg-[#2AABEE]/10 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#229ED9]">
                <MessageCircle size={14} />
                {uz.telegramProfile}
              </p>
              <p className="mt-1 font-medium text-zinc-900">{tgName}</p>
              {customer.telegramUsername && (
                <p className="text-sm text-zinc-600">
                  {uz.telegramUsernameLabel}: @{customer.telegramUsername}
                </p>
              )}
            </div>
          )}

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
          <Button
            type="button"
            variant="secondary"
            className="mt-5 w-full gap-2"
            onClick={logoutCustomer}
          >
            <LogOut size={18} />
            {uz.signOut}
          </Button>
        </Card>

        {message && (
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>
        )}

        <StaffPanelCard />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{uz.profile}</h1>
      <p className="mt-1 text-sm text-zinc-500">{uz.profileHint}</p>

      <div className="mt-6 flex gap-2 rounded-2xl bg-zinc-100 p-1.5">
        <TabButton active={pageTab === 'customer'} onClick={() => setPageTab('customer')}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <UserCircle size={16} />
            {uz.customer}
          </span>
        </TabButton>
        <TabButton active={pageTab === 'staff'} onClick={() => setPageTab('staff')}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <Users size={16} />
            {uz.staff}
          </span>
        </TabButton>
      </div>

      {pageTab === 'customer' ? (
        <Card className="mt-6 space-y-4 p-5">
          <p className="text-center text-sm text-zinc-600">{uz.loginSubtitle}</p>
          <Link href="/auth/login">
            <Button type="button" className="w-full gap-2 bg-[#2AABEE] hover:bg-[#229ED9]">
              <MessageCircle size={18} />
              {uz.loginWithTelegram}
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button type="button" variant="secondary" className="w-full">
              {uz.goToLogin}
            </Button>
          </Link>
        </Card>
      ) : (
        <StaffPanelCard />
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
