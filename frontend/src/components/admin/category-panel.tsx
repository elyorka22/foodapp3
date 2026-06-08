'use client';

import Link from 'next/link';
import { useDishCategories } from '@/hooks/use-dish-categories';
import { useAdminDishCategories } from '@/hooks/use-admin-dish-categories';
import { EmptyState } from '@/components/admin/ui';

/** Read-only preview of global dish categories with link to admin CRUD. */
export function CategoryPanel() {
  const { list: adminList } = useAdminDishCategories();
  const { data: publicList, isLoading: publicLoading } = useDishCategories();
  const rows = adminList.data?.length ? adminList.data : (publicList ?? []);
  const loading = adminList.isLoading || publicLoading;

  if (loading) {
    return <p className="text-sm opacity-60">Kategoriyalar yuklanmoqda…</p>;
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Taom kategoriyalari umumiy ro‘yxat — barcha restoranlar shu kategoriyalardan foydalanadi.{' '}
        <Link href="/admin/dish-categories" className="font-semibold text-brand-600 hover:underline">
          Kategoriyalarni boshqarish
        </Link>
      </p>
      {!rows.length ? (
        <EmptyState title="Kategoriyalar yo‘q" description="Admin panelda birinchi kategoriyani yarating." />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-full border px-3 py-1 text-xs dark:border-white/10"
            >
              {c.name}
              {!c.isActive ? ' (o‘chirilgan)' : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
