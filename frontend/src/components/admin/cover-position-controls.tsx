'use client';

import { coverObjectPosition } from '@/lib/cover-position';
import type { RestaurantForm } from '@/hooks/use-admin-restaurants';

type Props = {
  form: RestaurantForm;
  setForm: (f: RestaurantForm) => void;
};

export function CoverPositionControls({ form, setForm }: Props) {
  if (!form.coverUrl) return null;

  const x = form.coverPositionX ?? 50;
  const y = form.coverPositionY ?? 50;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900/50">
      <p className="text-xs font-semibold">Homepage card — image position</p>
      <div className="relative mx-auto aspect-[5/6] max-w-[140px] overflow-hidden rounded-xl bg-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={form.coverUrl}
          alt="Preview"
          className="h-full w-full object-cover"
          style={{ objectPosition: coverObjectPosition(x, y) }}
        />
      </div>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Horizontal</span>
          <span>{x}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={x}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => setForm({ ...form, coverPositionX: Number(e.target.value) })}
        />
        <span className="flex justify-between text-[10px] opacity-50">
          <span>Left</span>
          <span>Right</span>
        </span>
      </label>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Vertical</span>
          <span>{y}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={y}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => setForm({ ...form, coverPositionY: Number(e.target.value) })}
        />
        <span className="flex justify-between text-[10px] opacity-50">
          <span>Top</span>
          <span>Bottom</span>
        </span>
      </label>
    </div>
  );
}
