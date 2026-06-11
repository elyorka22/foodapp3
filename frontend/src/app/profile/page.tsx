'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GuestProfileView } from '@/components/profile/guest-profile-view';
import { ProfileAccountMenu } from '@/components/profile/profile-account-menu';
import { ProfilePageHeader } from '@/components/profile/profile-page-header';
import { ProfileSocialSection } from '@/components/profile/profile-social-section';
import { ProfileStaffLoginButton } from '@/components/profile/profile-staff-login-button';
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

function displayTelegramName(c: CustomerProfile): string {
  if (c.telegramFirstName) {
    return [c.telegramFirstName, c.telegramLastName].filter(Boolean).join(' ');
  }
  return c.fullName;
}

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
    const tgName = displayTelegramName(customer);
    const showTelegram = customer.isTelegramVerified || customer.telegramId;

    return (
      <main className="customer-page mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <ProfilePageHeader
          name={customer.fullName}
          photoUrl={customer.telegramPhotoUrl}
          badgeCount={unreadCount}
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

        <ProfileSocialSection />

        {showTelegram && (
          <Card className="mt-4 rounded-2xl border-0 bg-[#E8F7FD] p-4 shadow-none">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#229ED9]">
              <MessageCircle size={14} />
              {uz.telegramProfile}
            </p>
            <p className="mt-1 font-medium text-foreground">{tgName}</p>
            {customer.telegramUsername && (
              <p className="text-sm text-foreground-muted">
                {uz.telegramUsernameLabel}: @{customer.telegramUsername}
              </p>
            )}
          </Card>
        )}

        {customer.referralCode && (
          <Card className="mt-4 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-foreground-muted">{uz.yourReferral}</p>
            <p className="font-mono text-base font-semibold text-primary">{customer.referralCode}</p>
          </Card>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={logoutCustomer}
          >
            {uz.signOut}
          </Button>
          {customer.phone && (
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-500 hover:text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          )}
        </div>

        {showDeleteDialog && customer.phone && (
          <DeleteAccountDialog
            phone={customer.phone}
            token={getCustomerToken() ?? ''}
            onClose={() => setShowDeleteDialog(false)}
          />
        )}

        <ProfileStaffLoginButton className="mt-4" />

        {message && (
          <p className="mt-4 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            {message}
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-6 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <GuestProfileView onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}
