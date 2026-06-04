'use client';

import { clsx } from 'clsx';
import { categoryImageStyle, type CategoryImageFraming } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';

export type ImageFramingValues = CategoryImageFraming;

type Props = {
  imageUrl?: string | null;
  values: ImageFramingValues;
  onChange: (next: ImageFramingValues) => void;
  label: string;
  /** Tailwind aspect class, e.g. aspect-[2/1] */
  previewAspectClass?: string;
  previewMaxWidthClass?: string;
  className?: string;
};

export function ImageFramingControls({
  imageUrl,
  values,
  onChange,
  label,
  previewAspectClass = 'aspect-[2/1]',
  previewMaxWidthClass = 'max-w-full',
  className,
}: Props) {
  const scale = values.imageScale ?? 100;
  const x = values.imagePositionX ?? 50;
  const y = values.imagePositionY ?? 50;
  const previewSrc = imageUrl ? resolveImageUrl(imageUrl) ?? imageUrl : null;

  const set = (patch: Partial<ImageFramingValues>) =>
    onChange({ imageScale: scale, imagePositionX: x, imagePositionY: y, ...patch });

  return (
    <div
      className={clsx(
        'space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900/50',
        className,
      )}
    >
      <p className="text-xs font-semibold">{label}</p>
      <div
        className={clsx(
          'relative mx-auto w-full overflow-hidden rounded-xl bg-zinc-200',
          previewAspectClass,
          previewMaxWidthClass,
        )}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt="Preview"
            className="h-full w-full"
            style={categoryImageStyle({ imageScale: scale, imagePositionX: x, imagePositionY: y })}
          />
        ) : (
          <div className="flex h-full min-h-[80px] items-center justify-center text-xs text-zinc-400">
            Rasm yuklang — oldindan ko&apos;rish
          </div>
        )}
      </div>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Masshtab</span>
          <span>{scale}%</span>
        </span>
        <input
          type="range"
          min={50}
          max={200}
          value={scale}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => set({ imageScale: Number(e.target.value) })}
        />
      </label>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Gorizontal</span>
          <span>{x}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={x}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => set({ imagePositionX: Number(e.target.value) })}
        />
      </label>
      <label className="block text-xs">
        <span className="flex justify-between opacity-70">
          <span>Vertikal</span>
          <span>{y}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={y}
          className="mt-1 w-full accent-brand-600"
          onChange={(e) => set({ imagePositionY: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
