'use client';

import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function FavoritesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold text-zinc-900">Sevimlilar</h1>
      <div className="mt-8">
        <EmptyState
          icon={Heart}
          title="Hali sevimlilar yo'q"
          description="Restoranlarni yurakcha bilan saqlang — tez orada bu yerda ko'rinadi."
        />
      </div>
    </main>
  );
}
