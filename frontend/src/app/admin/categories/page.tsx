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

export default function AdminCategoriesPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
  const [restaurantId, setRestaurantId] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  useEffect(() => {
    if (!token) return;
    const fromUrl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('restaurantId')
        : null;
    api<{ data: { id: string; name: string }[] }>('/restaurants/admin?limit=100', { token })
      .then((res) => {
        setRestaurants(res.data);
        if (fromUrl && res.data.some((r) => r.id === fromUrl)) {
          setRestaurantId(fromUrl);
        } else if (!fromUrl && res.data[0]?.id) {
          setRestaurantId(res.data[0].id);
        }
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : 'Failed to load restaurants'),
      );
  }, [token]);

  const selected = restaurants.find((r) => r.id === restaurantId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Menu categories</h1>
          <p className="text-sm opacity-60">
            Create categories for each restaurant before adding products to the menu.
          </p>
        </div>
        <Link href="/admin/products">
          <Button type="button" variant="secondary">
            Go to products
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <label className="text-sm font-medium">Restaurant</label>
        <select
          className="mt-2 w-full max-w-md rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
        >
          <option value="">Select restaurant</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {!restaurantId ? (
        <EmptyState
          title="Select a restaurant"
          description="Choose a restaurant to manage its menu categories."
        />
      ) : (
        <>
          {selected && (
            <p className="text-sm opacity-70">
              Categories for <span className="font-semibold">{selected.name}</span>
            </p>
          )}
          <CategoryPanel restaurantId={restaurantId} />
        </>
      )}
    </div>
  );
}
