'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Percent, Sparkles, Leaf, Heart } from 'lucide-react';
import { useDishCategories } from '@/hooks/use-dish-categories';
import { useHomeBanners } from '@/hooks/use-home-data';
import { BannerSlotCarousel } from '@/components/home/banner-slot-carousel';
import { CategoryTileGrid } from '@/components/catalog/category-tile-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';

const QUICK = [
  { id: 'deals', label: uz.catalogDeals, Icon: Percent },
  { id: 'season', label: uz.catalogSeason, Icon: Leaf },
  { id: 'new', label: uz.catalogNew, Icon: Sparkles },
  { id: 'forYou', label: uz.catalogForYou, Icon: Heart },
] as const;

export default function CategoriesCatalogPage() {
  const [query, setQuery] = useState('');
  const categoriesQuery = useDishCategories();
  const bannersQuery = useHomeBanners();

  const categories = useMemo(() => {
    const list = (categoriesQuery.data ?? []).filter((c) => c.isActive !== false);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoriesQuery.data, query]);

  const tiles = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        href: `/categories/${encodeURIComponent(c.slug)}`,
        imageUrl: c.imageUrl,
      })),
    [categories],
  );

  const mid = Math.ceil(tiles.length / 2) || 0;
  const groupA = tiles.slice(0, mid);
  const groupB = tiles.slice(mid);

  const promoBanners = useMemo(() => {
    return (bannersQuery.data ?? [])
      .filter((b) => Boolean(resolveImageUrl(b.imageUrl)))
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 8);
  }, [bannersQuery.data]);

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-background px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <label className="flex h-11 items-center gap-2 rounded-2xl bg-zinc-100 px-3">
        <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uz.catalogSearchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </label>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK.map(({ id, label, Icon }) => (
          <Link
            key={id}
            href={id === 'deals' ? '/promotions' : '/categories'}
            className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 active:scale-[0.97]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">
              <Icon size={22} strokeWidth={2} />
            </span>
            <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-zinc-700">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {promoBanners.length > 0 ? (
        <div className="mt-4 h-[8.5rem]">
          <BannerSlotCarousel banners={promoBanners} />
        </div>
      ) : null}

      {categoriesQuery.isLoading ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[5/4] rounded-[16px]" />
          ))}
        </div>
      ) : tiles.length === 0 ? (
        <EmptyState
          title={uz.dishCategories}
          description={uz.menuEmptyHint}
          className="mt-10"
        />
      ) : (
        <>
          <CategoryTileGrid
            title={uz.catalogReadyFood}
            categories={groupA}
            tone="peach"
            allHref={groupB.length === 0 ? '/restaurants' : undefined}
            allLabel={uz.catalogAllReadyFood}
          />
          {groupB.length > 0 ? (
            <CategoryTileGrid
              title={uz.catalogMoreCategories}
              categories={groupB}
              tone="mint"
              allHref="/restaurants"
              allLabel={uz.seeAll}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
