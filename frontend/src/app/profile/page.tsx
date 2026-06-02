'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, MessageCircle, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GuestProfileView } from '@/components/profile/guest-profile-view';
import { StaffPanelCard } from '@/components/profile/staff-panel-card';
import { api } from '@/lib/api';
import {
  clearCustomer,
  customerNeedsPhone,
  getCustomer,
  getCustomerToken,
  setCustomerAuth,
  type CustomerProfile,
} from '@/lib/customer';
import type { CustomerAuthResponse } from '@/lib/customer-auth';
import { uz } from '@/lib/uz';

function displayTelegramName(c: CustomerProfile): string {
  if (c.telegramFirstName) {
    return [c.telegramFirstName, c.telegramLastName].filter(Boolean).join(' ');
  }
  return c.fullName;
}

export default function ProfilePage() {
  const [customer, setCustomerState] = useState<CustomerProfile | null>(null);
  const [message, setMessage] = useState('');
  const [staffOpen, setStaffOpen] = useState(false);

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

  const handleAuthSuccess = (res: CustomerAuthResponse) => {
    const user = res.user as CustomerProfile;
    setCustomerState(user);
    if (user.needsPhone || !user.phone) {
      window.location.href = '/complete-profile';
    } else {
      setMessage(uz.welcome(user.fullName));
    }
  };

  if (customer) {
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

        <div className="mt-10 border-t border-zinc-200/80 pt-6">
          {!staffOpen ? (
            <button
              type="button"
              onClick={() => setStaffOpen(true)}
              className="w-full text-center text-xs text-zinc-400 underline-offset-2 hover:text-zinc-500 hover:underline"
            >
              {uz.openStaffLogin}
            </button>
          ) : (
            <StaffPanelCard />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">{uz.profile}</h1>
      <GuestProfileView onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}
