'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { colors, shadows } from '@/lib/design-tokens';
import { uz } from '@/lib/uz';
import {
  StoreCategoryGrid,
  type StoreCategory,
} from '@/components/store/store-category-grid';

type Props = {
  open: boolean;
  categories: StoreCategory[];
  onClose: () => void;
  onSelect: (id: string) => void;
};

/** Bottom sheet with the full store category grid (not a separate page). */
export function StoreAllCategoriesSheet({
  open,
  categories,
  onClose,
  onSelect,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
        aria-label={uz.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-all-categories-title"
        className={clsx(
          'relative z-10 mx-auto flex w-full max-w-lg flex-col rounded-t-[24px] bg-white',
          'max-h-[85vh]',
        )}
        style={{ boxShadow: shadows.sheet }}
      >
        <div className="shrink-0 px-4 pb-2 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />
          <div className="flex items-center justify-between gap-3">
            <h2
              id="store-all-categories-title"
              className="text-[18px] font-extrabold tracking-tight text-zinc-900"
            >
              {uz.categories}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:scale-95"
              aria-label={uz.close}
            >
              <X size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-1">
          <StoreCategoryGrid
            categories={categories}
            onSelectCategory={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
