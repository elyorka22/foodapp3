'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { requestAccountDeletion } from '@/lib/account-deletion';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import { uz } from '@/lib/uz';
import { getCustomerToken } from '@/lib/customer';

const DATA_DELETED = [
  'Phone number',
  'User profile',
  'Saved addresses',
  'Location data',
  'Push notification tokens (FCM)',
  'Google authentication linkage',
  'Telegram authentication linkage',
  'Personal information',
  'Order history (anonymized)',
];

const DATA_RETAINED = [
  'Anonymized order records required for accounting, tax, and fraud prevention',
  'Payment-related metadata retained only as required by law',
  'Server logs retained for security monitoring',
];

export default function DeleteAccountPage() {
  const [justDeleted, setJustDeleted] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setJustDeleted(new URLSearchParams(window.location.search).get('deleted') === '1');
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidUzPhone(phone)) {
      setError(uz.phoneInvalid);
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = getCustomerToken() ?? undefined;
      const res = await requestAccountDeletion(
        {
          phone: normalizePhone(phone),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
        token,
      );
      setMessage(res.message);
      setPhone('');
      setEmail('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-10">
      <div className="flex items-center gap-2 py-4">
        <Link href="/" className="rounded-full p-2 active:bg-zinc-200" aria-label="Back to home">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Delete Account</h1>
      </div>

      {justDeleted && (
        <Card className="mb-4 border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Your account has been deleted. Thank you for using FoodApp.
          </p>
        </Card>
      )}

      <article className="space-y-4">
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 text-[#FF6B00]">
            <Trash2 size={20} />
            <h2 className="text-base font-semibold text-zinc-900">Account deletion</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            You can request deletion of your FoodApp customer account and associated personal data.
            No login is required on this page — submit the phone number linked to your account.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            If you are logged in, you can also delete your account from{' '}
            <Link href="/profile" className="font-medium text-[#FF6B00]">
              Profile
            </Link>
            .
          </p>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">What will be deleted</h2>
          <ul className="mt-3 space-y-2">
            {DATA_DELETED.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-zinc-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600" />
            <h2 className="text-base font-semibold text-zinc-900">Data we may retain</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {DATA_RETAINED.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-zinc-600">
                • {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-zinc-600">
            <strong>Retention period:</strong> anonymized order and financial records are kept for up
            to 5 years as required by applicable law. Security logs are retained for up to 90 days.
          </p>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">Request deletion</h2>
          <p className="mt-2 text-sm text-zinc-600">
            This action is permanent. Your profile, phone number, saved addresses, location
            information, notification tokens, authentication data and personal information will be
            deleted and cannot be recovered.
          </p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700">
                Phone number <span className="text-red-600">*</span>
              </label>
              <PhoneInput id="phone" name="phone" value={phone} onChange={setPhone} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
                Email (optional)
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium text-zinc-700">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Tell us why you are leaving (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {message && (
              <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>
            )}

            <Button type="submit" variant="danger" size="lg" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit deletion request'}
            </Button>
          </form>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">Contact & support</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Questions about account deletion or data privacy? Contact our support team:
          </p>
          <p className="mt-2 text-sm">
            Email:{' '}
            <a href="mailto:support@foodapp.uz" className="font-medium text-[#FF6B00]">
              support@foodapp.uz
            </a>
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            See also our{' '}
            <Link href="/privacy" className="font-medium text-[#FF6B00]">
              Privacy Policy
            </Link>
            .
          </p>
        </Card>
      </article>
    </main>
  );
}
