'use client';

import { categoryImageStyle, type CategoryImageFraming } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';

type FormWithImage = CategoryImageFraming & {
  imageUrl?: string;
};

type Props<T extends FormWithImage> = {
  form: T;
  setForm: (f: T) => void;
};

export function CategoryImagePositionControls<T extends FormWithImage>({ form, setForm }: Props<T>) {
  if (!form.imageUrl) return null;

  const scale = form.imageScale ?? 100;
  const x = form.imagePositionX ?? 50;
  const y = form.imagePositionY ?? 50;
  const previewSrc = resolveImageUrl(form.imageUrl) ?? form.imageUrl;

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900/50">
      <p className="text-xs font-semibold">Category card — image framing</p>
      <div className="relative mx-auto aspect-[4/3] max-w-[200px] overflow-hidden rounded-xl bg-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewSrc}
          alt="Preview"
          className="h-full w-full"
          style={categoryImageStyle({ imageScale: scale, imagePositionX: x, imagePositionY: y })}
        />
      </div>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Zoom</span>
          <span>{scale}%</span>
        </span>
        <input
          type="range"
          min={50}
          max={200}
          value={scale}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => setForm({ ...form, imageScale: Number(e.target.value) })}
        />
        <span className="flex justify-between text-[10px] opacity-50">
          <span>50%</span>
          <span>200%</span>
        </span>
      </label>
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
          onChange={(e) => setForm({ ...form, imagePositionX: Number(e.target.value) })}
        />
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
          onChange={(e) => setForm({ ...form, imagePositionY: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
