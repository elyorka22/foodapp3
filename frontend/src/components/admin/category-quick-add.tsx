'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminCategories } from '@/hooks/use-admin-categories';
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
  restaurantId: string;
  onCreated?: (categoryId: string) => void;
};

export function CategoryQuickAdd({ restaurantId, onCreated }: Props) {
  const { create } = useAdminCategories(restaurantId);
  const [name, setName] = useState('');

  const submit = async () => {
    if (!name.trim()) return;
    try {
      const created = (await create.mutateAsync({
        restaurantId,
        name: name.trim(),
        slug: slugify(name),
      })) as { id: string };
      setName('');
      toast.success('Category created');
      onCreated?.(created.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create category');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category name"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button type="button" onClick={submit} disabled={create.isPending || !name.trim()}>
        Add
      </Button>
    </div>
  );
}
