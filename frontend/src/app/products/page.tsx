'use client';

import { Apple } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { uz } from '@/lib/uz';

export default function ProductsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <div className="mt-8">
        <EmptyState
          icon={Apple}
          title={uz.productsTitle}
          description={uz.productsEmptyHint}
        />
      </div>
    </main>
  );
}
