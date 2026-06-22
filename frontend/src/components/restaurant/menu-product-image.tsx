'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { menuProductImageStyle } from '@/lib/menu-product-image-style';

const DEFAULT_STYLE: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
};

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
};

export function MenuProductImage({
  src,
  alt,
  sizes = '(max-width: 430px) 50vw, 215px',
  className = 'h-full w-full',
}: Props) {
  const [style, setStyle] = useState<CSSProperties>(DEFAULT_STYLE);

  useEffect(() => {
    setStyle(DEFAULT_STYLE);
  }, [src]);

  const applyStyle = useCallback((img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    setStyle(menuProductImageStyle(img.naturalWidth, img.naturalHeight));
  }, []);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className={className}
      style={style}
      onLoad={(event) => applyStyle(event.currentTarget)}
      ref={(img) => {
        if (img?.complete) applyStyle(img);
      }}
    />
  );
}
