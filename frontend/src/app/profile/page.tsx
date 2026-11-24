'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GuestProfileView } from '@/components/profile/guest-profile-view';
import { ProfileAccountMenu } from '@/components/profile/profile-account-menu';
import { ProfilePageHeader } from '@/components/profile/profile-page-header';
import { ProfileSocialSection } from '@/components/profile/profile-social-section';
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
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

export default function ProfilePage() {
  const [customer, setCustomerState] = useState<CustomerProfile | null>(null);
  const [message, setMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { unread } = useCustomerNotifications();
  const unreadCount = unread.data?.count ?? 0;

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
    return (
      <main className="customer-page mx-auto min-h-screen max-w-lg bg-background px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <ProfilePageHeader
          name={customer.fullName}
          phone={customer.phone}
          unreadCount={unreadCount}
        />

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

        <ProfileAccountMenu />

        <button
          type="button"
          onClick={logoutCustomer}
          className="mt-5 flex min-h-[48px] items-center gap-3 px-1 text-[16px] font-semibold text-red-600 transition active:opacity-70"
        >
          <LogOut size={22} strokeWidth={1.85} />
          {uz.signOut}
        </button>

        {customer.phone ? (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="mt-1 px-1 text-[13px] font-medium text-zinc-400 transition hover:text-red-600"
          >
            Delete Account
          </button>
        ) : null}

        <ProfileSocialSection />

        <Link
          href="/hamkorlik"
          className="mt-6 block px-1 text-center text-[13px] font-medium text-zinc-400"
        >
          {uz.profilePartnership}
        </Link>

        {showDeleteDialog && customer.phone ? (
          <DeleteAccountDialog
            phone={customer.phone}
            token={getCustomerToken() ?? ''}
            onClose={() => setShowDeleteDialog(false)}
          />
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            {message}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-background px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <GuestProfileView onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}
