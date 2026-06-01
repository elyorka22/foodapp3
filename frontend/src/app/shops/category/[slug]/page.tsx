'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { ShopBusinessCard } from '@/components/shops/shop-business-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessTypes, useShops } from '@/hooks/use-shops-data';
import { isCatalogMode } from '@/lib/business-catalog-mode';
import { uz } from '@/lib/uz';

export default function ShopCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const typesQuery = useBusinessTypes();
  const category = typesQuery.data?.find((t) => t.slug === slug);

  const shopsQuery = useShops({
    type: slug,
    limit: 50,
  });

  const businesses = shopsQuery.data?.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <Link
        href="/shops"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600"
      >
        <ArrowLeft size={16} />
        {uz.shopsTitle}
      </Link>
      <h1 className="mt-4 text-xl font-bold text-zinc-900">{category?.name ?? slug}</h1>
      {category && (
        <p className="text-sm text-zinc-500">
          {isCatalogMode(category.catalogMode)
            ? 'Menyu va buyurtma mavjud'
            : 'Kontakt maʼlumotlari'}
        </p>
      )}

      {shopsQuery.isLoading || typesQuery.isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
          Hozircha do&apos;konlar yo&apos;q
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {businesses.map((b) => (
            <ShopBusinessCard key={b.id} business={b} className="w-full shrink" />
          ))}
        </div>
      )}
    </main>
  );
}
