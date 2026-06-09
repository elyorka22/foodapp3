import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SiteJsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, canonicalUrl } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service | FoodApp',
  description:
    'FoodApp foydalanish shartlari: hisob, buyurtmalar, yetkazib berish va xizmat qoidalari.',
  path: '/terms',
});

const sections = [
  {
    title: 'Acceptance of Terms',
    body:
      'By accessing or using FoodApp, you agree to these Terms of Service. If you do not agree, please do not use the platform.',
  },
  {
    title: 'User Accounts',
    body:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate registration information.',
  },
  {
    title: 'Orders',
    body:
      'Orders placed through FoodApp are subject to restaurant availability, pricing shown at checkout, and confirmation by participating merchants. We may cancel or modify orders when necessary for operational or legal reasons.',
  },
  {
    title: 'Deliveries',
    body:
      'Delivery times are estimates and may vary due to traffic, weather, restaurant preparation time, or courier availability. You must provide a valid delivery location and be reachable during fulfillment.',
  },
  {
    title: 'Payments',
    body:
      'You agree to pay all charges associated with your orders, including food, delivery fees, taxes, and applicable promotions or adjustments shown before confirmation.',
  },
  {
    title: 'Prohibited Activities',
    body:
      'You may not misuse the service, submit fraudulent orders, harass couriers or staff, attempt unauthorized access, or use FoodApp for unlawful purposes.',
  },
  {
    title: 'Account Suspension',
    body:
      'We may suspend or terminate accounts that violate these terms, create risk for users or partners, or engage in abuse, fraud, or repeated policy violations.',
  },
  {
    title: 'Limitation of Liability',
    body:
      'FoodApp is provided on an &quot;as is&quot; basis to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from use of the service.',
  },
  {
    title: 'Changes to Terms',
    body:
      'We may update these Terms from time to time. Continued use of FoodApp after changes become effective constitutes acceptance of the revised Terms.',
  },
  {
    title: 'Contact Information',
    body: 'For questions about these Terms, contact support@foodapp.uz.',
  },
];

export default function TermsPage() {
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
          <h1 className="text-xl font-bold text-zinc-900">Terms of Service</h1>
        </div>

        <article className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm leading-relaxed text-zinc-600">
            Last updated: {new Date().toISOString().slice(0, 10)}. These Terms govern your use of{' '}
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
