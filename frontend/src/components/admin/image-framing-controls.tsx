'use client';

import { clsx } from 'clsx';
import {
  categoryImagePanStyle,
  type CategoryImageFraming,
} from '@/lib/category-image-style';
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
  /** e.g. rounded-full for store category circles */
  previewRoundedClass?: string;
  className?: string;
};

export function ImageFramingControls({
  imageUrl,
  values,
  onChange,
  label,
  previewAspectClass = 'aspect-[2/1]',
  previewMaxWidthClass = 'max-w-full',
  previewRoundedClass = 'rounded-xl',
  className,
}: Props) {
  const scale = Math.max(100, values.imageScale ?? 100);
  const x = values.imagePositionX ?? 50;
  const y = values.imagePositionY ?? 50;
  const previewSrc = imageUrl ? resolveImageUrl(imageUrl) ?? imageUrl : null;
  // left/top pan so vertical slider works on square tiles too
  const pan = categoryImagePanStyle({
    imageScale: scale,
    imagePositionX: x,
    imagePositionY: y,
  });

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
          'relative mx-auto w-full overflow-hidden bg-zinc-200',
          previewRoundedClass,
          previewAspectClass,
          previewMaxWidthClass,
        )}
      >
        {previewSrc ? (
          <div className={clsx('absolute inset-0 overflow-hidden', previewRoundedClass)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Preview" style={pan} />
          </div>
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
          min={100}
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
