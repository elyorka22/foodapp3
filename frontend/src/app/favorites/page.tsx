'use client';

import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { uz } from '@/lib/uz';

export default function FavoritesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <div className="mt-6">
        <h1 className="text-xl font-bold text-zinc-900">{uz.favoritesTitle}</h1>
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title={uz.favoritesEmpty}
            description={uz.favoritesEmptyHint}
          />
        </div>
      </div>
    </main>
  );
}
