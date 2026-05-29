'use client';

import { useMemo, useState } from 'react';
import { Search, Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { CategoryRow, PromoTile, type CategoryChip } from '@/components/home/category-row';
import { RestaurantCard } from '@/components/home/restaurant-card';
import { SectionHeader } from '@/components/home/section-header';
import {
  useHomeBanners,
  useHomeRestaurants,
  type HomeRestaurant,
} from '@/hooks/use-home-data';
import { resolveImageUrl } from '@/lib/image-url';

function collectCategories(restaurants: HomeRestaurant[]): CategoryChip[] {
  const map = new Map<string, CategoryChip>();
  for (const r of restaurants) {
    for (const c of r.categories ?? []) {
      if (!map.has(c.slug)) map.set(c.slug, c);
    }
  }
  return Array.from(map.values()).slice(0, 12);
}

function filterByCategory(restaurants: HomeRestaurant[], slug: string | null) {
  if (!slug) return restaurants;
  return restaurants.filter((r) =>
    r.categories?.some((c) => c.slug.toLowerCase() === slug.toLowerCase()),
  );
}

export default function HomePage() {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();

  const restaurants = useMemo(
    () => restaurantsQuery.data?.data ?? [],
    [restaurantsQuery.data?.data],
  );
  const banners = bannersQuery.data ?? [];

  const categories = useMemo(() => collectCategories(restaurants), [restaurants]);

  const filtered = useMemo(
    () => filterByCategory(restaurants, categorySlug),
    [restaurants, categorySlug],
  );

  const popular = filtered.slice(0, 6);
  const newest = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 8);
  }, [filtered]);

  const promoBanners = banners.length > 1 ? banners.slice(1) : banners;
  const isLoading = restaurantsQuery.isLoading || bannersQuery.isLoading;
  const hasError = restaurantsQuery.isError;

  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-3">
      {/* Search affordance */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <Search size={18} className="shrink-0 text-zinc-400" />
        <span className="text-sm text-zinc-500">Search restaurants & dishes</span>
      </div>

      {/* Hero */}
      <section aria-label="Promotions">
        <BannerCarousel banners={banners} isLoading={bannersQuery.isLoading} />
      </section>

      {/* Categories */}
      <section className="mt-6" aria-label="Categories">
        <SectionHeader title="Categories" subtitle="What are you craving?" />
        {isLoading ? (
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <CategoryRow
            categories={categories}
            activeSlug={categorySlug}
            onSelect={setCategorySlug}
          />
        )}
      </section>

      {/* Promotions */}
      <section className="mt-6" aria-label="Featured offers">
        <SectionHeader title="Featured offers" />
        {bannersQuery.isLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-24 min-w-[10.5rem] rounded-2xl" />
            <Skeleton className="h-24 min-w-[10.5rem] rounded-2xl" />
          </div>
        ) : promoBanners.length > 0 ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {promoBanners.map((b) => (
              <PromoTile
                key={b.id}
                title={b.title}
                imageUrl={resolveImageUrl(b.imageUrl) ?? undefined}
                href={b.linkUrl?.trim() || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4">
            <PromoTile title="Free delivery on first order" />
            <PromoTile title="Up to 20% off selected restaurants" />
          </div>
        )}
      </section>

      {/* Popular */}
      <section className="mt-8" aria-label="Popular restaurants">
        <SectionHeader title="Popular near you" subtitle="Top picks this week" />
        {restaurantsQuery.isLoading && (
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <Skeleton className="h-[5.5rem] w-full rounded-2xl" />
              </li>
            ))}
          </ul>
        )}
        {hasError && (
          <EmptyState
            icon={Store}
            title="Could not load restaurants"
            description={
              restaurantsQuery.error instanceof Error
                ? restaurantsQuery.error.message
                : 'Check your connection and try again.'
            }
            action={
              <Button type="button" size="sm" onClick={() => restaurantsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        )}
        {!restaurantsQuery.isLoading && !hasError && popular.length > 0 && (
          <ul className="space-y-3">
            {popular.map((r) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} variant="horizontal" />
              </li>
            ))}
          </ul>
        )}
        {!restaurantsQuery.isLoading && !hasError && popular.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title={categorySlug ? 'No matches in this category' : 'New restaurants coming soon'}
            description={
              categorySlug
                ? 'Try another category or check back later.'
                : 'Our partners are getting ready. Browse featured offers above or check back shortly.'
            }
            action={
              categorySlug ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => setCategorySlug(null)}>
                  Show all
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      {/* New */}
      <section className="mt-8" aria-label="New restaurants">
        <SectionHeader title="New on FoodApp" />
        {restaurantsQuery.isLoading ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-[9.5rem] shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : newest.length > 0 ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {newest.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} variant="vertical" />
            ))}
          </div>
        ) : !hasError ? (
          <p className="text-center text-sm text-zinc-500">
            Fresh restaurant partners will appear here.
          </p>
        ) : null}
      </section>

      {/* Full list when filtered */}
      {categorySlug && filtered.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={`All in ${categorySlug}`} />
          <ul className="space-y-3">
            {filtered.map((r) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} variant="horizontal" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
