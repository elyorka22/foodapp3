'use client';

import { Tag } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

export default function PromotionsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <h1 className="mb-4 text-xl font-bold text-foreground">{uz.promotionsTitle}</h1>
      <EmptyState
        icon={Tag}
        title={uz.promotionsTitle}
        description={uz.promotionsEmptyHint}
      />
    </main>
  );
}
