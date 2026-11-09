'use client';

import Link from 'next/link';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { CategoryPanel } from '@/components/admin/category-panel';
import { StoreCategoryPanel } from '@/components/admin/store-category-panel';
import { EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';

type Props = {
  title: string;
  vertical: 'restaurant' | 'store';
  listHref: string;
  /** Required for store vertical — shared catalog for this type slug */
  typeSlug?: string;
};

export function MerchantCategoriesPage({ title, vertical, listHref, typeSlug }: Props) {
  const permission = vertical === 'store' ? 'store.categories' : 'restaurant.categories';
  const { ready, authorized } = useAdminAccess({ permission });
  const types = useAdminBusinessTypes();
  const type = (types.list.data ?? []).find((t) => t.slug === typeSlug);
  const typeName = type?.name ?? typeSlug ?? '';

  if (!ready) return null;
  if (!authorized) return null;

  if (vertical === 'restaurant') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Taom kategoriyalari barcha restoranlar uchun umumiy. Restoranlar faqat mahsulot
              yaratishda tanlaydi.
            </p>
          </div>
          <Link href={listHref}>
            <Button type="button" variant="secondary">
              Ro&apos;yxatga
            </Button>
          </Link>
        </div>
        <CategoryPanel />
      </div>
    );
  }

  if (!typeSlug) {
    return (
      <EmptyState
        title="Tur tanlang"
        description="Do‘kon kategoriyalari biznes turi bo‘yicha umumiy. Sidebar orqali tur sahifasiga o‘ting."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Shu turdagi barcha do&apos;konlar uchun umumiy kategoriyalar. Faqat admin
            tahrirlaydi; do&apos;kon egasi faqat mahsulotda tanlaydi.
          </p>
        </div>
        <Link href={listHref}>
          <Button type="button" variant="secondary">
            Ro&apos;yxatga
          </Button>
        </Link>
      </div>

      <StoreCategoryPanel typeSlug={typeSlug} typeName={typeName} />
    </div>
  );
}
