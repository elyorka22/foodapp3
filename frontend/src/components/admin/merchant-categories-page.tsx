'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';
import { CategoryPanel } from '@/components/admin/category-panel';
import { EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  vertical: 'restaurant' | 'store';
  listHref: string;
};

export function MerchantCategoriesPage({ title, vertical, listHref }: Props) {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [merchants, setMerchants] = useState<{ id: string; name: string }[]>([]);
  const [merchantId, setMerchantId] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/staff/login');
  }, [token, user, router]);

  useEffect(() => {
    if (!token) return;
    const fromUrl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('businessId') ??
          new URLSearchParams(window.location.search).get('restaurantId')
        : null;

    api<{ data: { id: string; name: string }[] }>(
      `/restaurants/admin?limit=100&vertical=${vertical}`,
      { token },
    )
      .then((res) => {
        setMerchants(res.data);
        if (fromUrl && res.data.some((r) => r.id === fromUrl)) {
          setMerchantId(fromUrl);
        } else if (res.data[0]?.id) {
          setMerchantId(res.data[0].id);
        }
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Yuklashda xatolik'),
      );
  }, [token, vertical]);

  const selected = merchants.find((r) => r.id === merchantId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {vertical === 'restaurant'
              ? 'Faqat restoran menyusi kategoriyalari'
              : "Faqat do'kon mahsulot kategoriyalari"}
          </p>
        </div>
        <Link href={listHref}>
          <Button type="button" variant="secondary">
            Ro&apos;yxatga
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium" htmlFor="merchant-select">
          {vertical === 'restaurant' ? 'Restoran' : "Do'kon"}
        </label>
        <select
          id="merchant-select"
          className="min-w-[220px] rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
        >
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {!merchantId ? (
        <EmptyState title="Tanlang" description="Kategoriyalarni ko'rish uchun savdo nuqtasini tanlang." />
      ) : (
        <CategoryPanel key={merchantId} restaurantId={merchantId} />
      )}
    </div>
  );
}
