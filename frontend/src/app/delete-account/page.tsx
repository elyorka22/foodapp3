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
import { getCustomerToken } from '@/lib/customer';

type Lang = 'uz' | 'en';

const COPY = {
  uz: {
    switchLabel: 'English',
    back: 'Bosh sahifa',
    title: 'Hisobni o‘chirish',
    justDeleted: 'Hisobingiz o‘chirildi. FoodAppdan foydalanganingiz uchun rahmat.',
    introTitle: 'Hisobni o‘chirish',
    intro:
      'FoodApp mijoz hisobingizni va unga bog‘liq shaxsiy ma’lumotlarni o‘chirishni so‘rashingiz mumkin. Bu sahifada tizimga kirish shart emas — hisobingizga bog‘langan telefon raqamini yuboring.',
    introProfileBefore: 'Agar tizimga kirgan bo‘lsangiz, hisobni ',
    introProfileLink: 'Profil',
    introProfileAfter: ' sahifasidan ham o‘chirishingiz mumkin.',
    deletedTitle: 'Nima o‘chiriladi',
    deleted: [
      'Telefon raqami',
      'Foydalanuvchi profili',
      'Saqlangan manzillar',
      'Joylashuv ma’lumotlari',
      'Push-bildirishnoma tokenlari (FCM)',
      'Google orqali kirish bog‘lanishi',
      'Shaxsiy ma’lumotlar',
      'Buyurtmalar tarixi (anonimlashtiriladi)',
    ],
    retainedTitle: 'Saqlab qolinishi mumkin bo‘lgan ma’lumotlar',
    retained: [
      'Buxgalteriya, soliq va firibgarlikning oldini olish uchun anonim buyurtma yozuvlari',
      'Qonun talab qiladigan to‘lovga oid meta-ma’lumotlar',
      'Xavfsizlik nazorati uchun server jurnallari',
    ],
    retention:
      'Saqlash muddati: anonim buyurtma va moliyaviy yozuvlar qonunga muvofiq 5 yilgacha saqlanadi. Xavfsizlik jurnallari 90 kungacha saqlanadi.',
    formTitle: 'O‘chirish so‘rovi',
    formBody:
      'Bu amalni qaytarib bo‘lmaydi. Profil, telefon raqami, saqlangan manzillar, joylashuv, bildirishnoma tokenlari, kirish ma’lumotlari va shaxsiy ma’lumotlar o‘chiriladi va tiklanmaydi.',
    phone: 'Telefon raqami',
    email: 'Email (ixtiyoriy)',
    reason: 'Sabab (ixtiyoriy)',
    reasonPlaceholder: 'Nima uchun ketayotganingizni yozing (ixtiyoriy)',
    phoneInvalid: 'Telefon raqam noto‘g‘ri',
    requestFailed: 'So‘rov yuborilmadi',
    success:
      'Hisobni o‘chirish so‘rovi qabul qilindi. Bu raqamda hisob bo‘lsa, u o‘chirishga qo‘yiladi.',
    submitting: 'Yuborilmoqda…',
    submit: 'O‘chirish so‘rovini yuborish',
    supportTitle: 'Aloqa va yordam',
    support:
      'Hisobni o‘chirish yoki ma’lumotlar maxfiyligi bo‘yicha savol bo‘lsa, qo‘llab-quvvatlash xizmatiga yozing:',
    privacyBefore: 'Shuningdek, ',
    privacyLink: 'Maxfiylik siyosati',
    privacyAfter: ' bilan tanishing.',
  },
  en: {
    switchLabel: 'O‘zbekcha',
    back: 'Back to home',
    title: 'Delete Account',
    justDeleted: 'Your account has been deleted. Thank you for using FoodApp.',
    introTitle: 'Account deletion',
    intro:
      'You can request deletion of your FoodApp customer account and associated personal data. No login is required on this page — submit the phone number linked to your account.',
    introProfileBefore: 'If you are logged in, you can also delete your account from ',
    introProfileLink: 'Profile',
    introProfileAfter: '.',
    deletedTitle: 'What will be deleted',
    deleted: [
      'Phone number',
      'User profile',
      'Saved addresses',
      'Location data',
      'Push notification tokens (FCM)',
      'Google authentication linkage',
      'Personal information',
      'Order history (anonymized)',
    ],
    retainedTitle: 'Data we may retain',
    retained: [
      'Anonymized order records required for accounting, tax, and fraud prevention',
      'Payment-related metadata retained only as required by law',
      'Server logs retained for security monitoring',
    ],
    retention:
      'Retention period: anonymized order and financial records are kept for up to 5 years as required by applicable law. Security logs are retained for up to 90 days.',
    formTitle: 'Request deletion',
    formBody:
      'This action is permanent. Your profile, phone number, saved addresses, location information, notification tokens, authentication data and personal information will be deleted and cannot be recovered.',
    phone: 'Phone number',
    email: 'Email (optional)',
    reason: 'Reason (optional)',
    reasonPlaceholder: 'Tell us why you are leaving (optional)',
    phoneInvalid: 'Phone number is invalid',
    requestFailed: 'Request failed',
    success:
      'Your account deletion request has been received. If an account exists for this phone number, it has been scheduled for deletion.',
    submitting: 'Submitting…',
    submit: 'Submit deletion request',
    supportTitle: 'Contact & support',
    support: 'Questions about account deletion or data privacy? Contact our support team:',
    privacyBefore: 'See also our ',
    privacyLink: 'Privacy Policy',
    privacyAfter: '.',
  },
} as const;

export default function DeleteAccountPage() {
  const [lang, setLang] = useState<Lang>('uz');
  const [justDeleted, setJustDeleted] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const t = COPY[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setJustDeleted(new URLSearchParams(window.location.search).get('deleted') === '1');
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidUzPhone(phone)) {
      setError(t.phoneInvalid);
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = getCustomerToken() ?? undefined;
      await requestAccountDeletion(
        {
          phone: normalizePhone(phone),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
        token,
      );
      setMessage(t.success);
      setPhone('');
      setEmail('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.requestFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-background px-4 pb-10">
      <div className="flex items-center gap-2 py-4">
        <Link href="/" className="rounded-full p-2 active:bg-zinc-200" aria-label={t.back}>
          <ChevronLeft size={22} />
        </Link>
        <h1 className="min-w-0 flex-1 text-xl font-bold text-zinc-900">{t.title}</h1>
        <button
          type="button"
          onClick={() => {
            setLang(lang === 'uz' ? 'en' : 'uz');
            setError('');
            setMessage('');
          }}
          className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800"
        >
          {t.switchLabel}
        </button>
      </div>

      {justDeleted && (
        <Card className="mb-4 border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">{t.justDeleted}</p>
        </Card>
      )}

      <article className="space-y-4">
        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 text-[#18181B]">
            <Trash2 size={20} />
            <h2 className="text-base font-semibold text-zinc-900">{t.introTitle}</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{t.intro}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {t.introProfileBefore}
            <Link href="/profile" className="font-medium text-[#18181B]">
              {t.introProfileLink}
            </Link>
            {t.introProfileAfter}
          </p>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">{t.deletedTitle}</h2>
          <ul className="mt-3 space-y-2">
            {t.deleted.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-zinc-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#18181B]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600" />
            <h2 className="text-base font-semibold text-zinc-900">{t.retainedTitle}</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {t.retained.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-zinc-600">
                • {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-zinc-600">{t.retention}</p>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">{t.formTitle}</h2>
          <p className="mt-2 text-sm text-zinc-600">{t.formBody}</p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-700">
                {t.phone} <span className="text-red-600">*</span>
              </label>
              <PhoneInput id="phone" name="phone" value={phone} onChange={setPhone} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
                {t.email}
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
                {t.reason}
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder={t.reasonPlaceholder}
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
              {loading ? t.submitting : t.submit}
            </Button>
          </form>
        </Card>

        <Card className="rounded-2xl p-5 shadow-card">
          <h2 className="text-base font-semibold text-zinc-900">{t.supportTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t.support}</p>
          <p className="mt-2 text-sm">
            Email:{' '}
            <a href="mailto:support@foodapp.uz" className="font-medium text-[#18181B]">
              support@foodapp.uz
            </a>
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            {t.privacyBefore}
            <Link href="/privacy" className="font-medium text-[#18181B]">
              {t.privacyLink}
            </Link>
            {t.privacyAfter}
          </p>
        </Card>
      </article>
    </main>
  );
}
