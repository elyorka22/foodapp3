'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { menuProductImageStyle } from '@/lib/menu-product-image-style';

const DEFAULT_STYLE: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
};

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function MenuProductImage({
  src,
  alt,
  className = 'h-full w-full bg-white',
}: Props) {
  const [style, setStyle] = useState<CSSProperties>(DEFAULT_STYLE);

  useEffect(() => {
    setStyle(DEFAULT_STYLE);
  }, [src]);

  const onLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setStyle(menuProductImageStyle(img.naturalWidth, img.naturalHeight));
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={style} onLoad={onLoad} />
  );
}
