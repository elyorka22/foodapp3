'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminProductCategories, type StoreCategoryForm } from '@/hooks/use-admin-product-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/admin/ui';
import { slugify } from '@/lib/slugify';

type Props = {
  businessId: string;
  businessName: string;
};

export function StoreCategoryPanel({ businessId, businessName }: Props) {
  const { list, create, remove } = useAdminProductCategories(businessId);
  const [form, setForm] = useState<StoreCategoryForm>({ name: '', slug: '', sortOrder: 0 });

  const rows = list.data ?? [];

  const onCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Nom kiriting');
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
      });
      setForm({ name: '', slug: '', sortOrder: 0 });
      toast.success('Kategoriya qo‘shildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    }
  };

  if (list.isLoading) {
    return <p className="text-sm opacity-60">Yuklanmoqda…</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <strong>{businessName}</strong> — mahsulot kategoriyalari faqat shu do‘kon uchun.
      </p>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Kategoriya nomi"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="max-w-xs"
        />
        <Button type="button" onClick={onCreate} disabled={create.isPending}>
          Qo‘shish
        </Button>
      </div>

      {!rows.length ? (
        <EmptyState title="Kategoriyalar yo‘q" description="Birinchi kategoriyani yarating." />
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-white/10"
            >
              <span>
                {c.name}
                {c.isActive === false ? ' (o‘chirilgan)' : ''}
              </span>
              <Button
                type="button"
                variant="danger"
                className="!px-2 !py-1 text-xs"
                onClick={async () => {
                  try {
                    await remove.mutateAsync(c.id);
                    toast.success('O‘chirildi');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Xatolik');
                  }
                }}
              >
                O‘chirish
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
