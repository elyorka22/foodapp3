'use client';

import Image from 'next/image';
import { resolveImageUrl } from '@/lib/image-url';

type Props = {
  label: string;
  hint?: string;
  imageUrl?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
};

export function BusinessImageUpload({ label, hint, imageUrl, disabled, onFile }: Props) {
  const src = imageUrl ? resolveImageUrl(imageUrl) ?? imageUrl : null;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium opacity-70">
        {label}
        {hint && <span className="mt-0.5 block font-normal opacity-60">{hint}</span>}
      </label>
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        className="block w-full text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      {src && (
        <div className="relative aspect-[16/10] max-h-32 overflow-hidden rounded-lg border bg-zinc-100 dark:border-white/10">
          <Image src={src} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
    </div>
  );
}
