'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { useBusinessTypes } from '@/hooks/use-shops-data';
import { uz } from '@/lib/uz';

/** Category detail — business list will be added in a follow-up. */
export default function ShopCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const typesQuery = useBusinessTypes();
  const category = typesQuery.data?.find((t) => t.slug === slug);

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
      <h1 className="mt-4 text-xl font-bold text-zinc-900">
        {category?.name ?? slug}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Do&apos;konlar ro&apos;yxati tez orada qo&apos;shiladi.
      </p>
    </main>
  );
}
