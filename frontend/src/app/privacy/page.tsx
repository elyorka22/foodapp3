import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SiteJsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, canonicalUrl } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy | FoodApp',
  description:
    'FoodApp maxfiylik siyosati: ma\'lumotlaringiz qanday to\'planishi, saqlanishi va himoya qilinishi haqida.',
  path: '/privacy',
});

const sections = [
  {
    title: 'Information We Collect',
    body:
      'FoodApp collects information necessary to provide food delivery services, improve our platform, and communicate with you about your orders and account.',
  },
  {
    title: 'Account Information',
    body:
      'When you create an account, we may collect your name, email address, phone number, delivery preferences, and authentication identifiers linked to your profile.',
  },
  {
    title: 'Google Authentication',
    body:
      'If you sign in with Google, we receive your Firebase-authenticated profile data such as your Google user ID, email address, name, and profile photo. We verify this information on our servers and do not trust client-provided email addresses directly.',
  },
  {
    title: 'Phone Number Usage',
    body:
      'Your phone number is used to identify your account, coordinate deliveries, contact you about active orders, and provide customer support when needed.',
  },
  {
    title: 'Order Information',
    body:
      'We collect order details including selected restaurants, items, delivery address, payment-related metadata, order status, and communication history related to fulfillment.',
  },
  {
    title: 'Push Notifications',
    body:
      'With your permission, we store device tokens to send order updates, delivery notifications, and service announcements. You can disable notifications in your device settings.',
  },
  {
    title: 'Data Storage',
    body:
      'Your data is stored on secure servers used to operate FoodApp, including account records, order history, and notification preferences, in accordance with applicable law.',
  },
  {
    title: 'Data Security',
    body:
      'We apply administrative, technical, and organizational safeguards to protect personal data. No method of transmission or storage is completely secure, but we work to reduce unauthorized access and misuse.',
  },
  {
    title: 'User Rights',
    body:
      'You may request access, correction, or deletion of your personal information, and you may withdraw consent for optional processing such as marketing notifications, subject to legal and operational requirements. To delete your account, visit our account deletion page or use the Delete Account option in the app Profile.',
  },
  {
    title: 'Contact Information',
    body: 'For privacy questions or requests, contact us at support@foodapp.uz.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteJsonLd />
      <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-10">
        <div className="flex items-center gap-2 py-4">
          <Link
            href="/"
            className="rounded-full p-2 active:bg-zinc-200"
            aria-label="Back to home"
          >
            <ChevronLeft size={22} />
          </Link>
          <h1 className="text-xl font-bold text-zinc-900">Privacy Policy</h1>
        </div>

        <article className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm leading-relaxed text-zinc-600">
            Last updated: {new Date().toISOString().slice(0, 10)}. This Privacy Policy explains how
            FoodApp (&quot;we&quot;, &quot;us&quot;) handles personal information when you use{' '}
            <a href={canonicalUrl('/')} className="font-medium text-[#FF6B00]">
              foodapp.uz
            </a>
            .
          </p>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-zinc-900">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{section.body}</p>
            </section>
          ))}

          <p className="border-t border-zinc-100 pt-4 text-sm text-zinc-600">
            To request account deletion, visit{' '}
            <Link href="/delete-account" className="font-medium text-[#FF6B00]">
              Delete Account
            </Link>
            .
          </p>
          <p className="text-sm text-zinc-600">
            Email:{' '}
            <a href="mailto:support@foodapp.uz" className="font-medium text-[#FF6B00]">
              support@foodapp.uz
            </a>
          </p>
        </article>
      </main>
    </>
  );
}
