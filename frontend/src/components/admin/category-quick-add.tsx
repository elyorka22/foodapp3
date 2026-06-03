'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAdminDishCategories } from '@/hooks/use-admin-dish-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type Props = {
  onCreated?: (categoryId: string) => void;
};

export function CategoryQuickAdd({ onCreated }: Props) {
  const { create } = useAdminDishCategories();
  const [name, setName] = useState('');

  const submit = async () => {
    if (!name.trim()) return;
    try {
      const created = (await create.mutateAsync({
        name: name.trim(),
        slug: slugify(name),
      })) as { id: string };
      setName('');
      toast.success('Kategoriya yaratildi');
      onCreated?.(created.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create category');
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        Umumiy kategoriya qo‘shiladi —{' '}
        <Link href="/admin/dish-categories" className="text-brand-600 underline">
          to‘liq boshqaruv
        </Link>
      </p>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yangi kategoriya nomi"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" onClick={submit} disabled={create.isPending || !name.trim()}>
          Qo‘shish
        </Button>
      </div>
    </div>
  );
}
