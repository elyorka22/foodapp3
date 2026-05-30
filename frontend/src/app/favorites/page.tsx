'use client';

import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

export default function FavoritesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold text-zinc-900">{uz.favoritesTitle}</h1>
      <div className="mt-8">
        <EmptyState
          icon={Heart}
          title={uz.favoritesEmpty}
          description={uz.favoritesEmptyHint}
        />
      </div>
    </main>
  );
}
