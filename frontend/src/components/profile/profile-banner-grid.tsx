'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export function ProfileBannerGrid({ children, className }: Props) {
  return (
    <div
      className={className ?? 'mt-6 grid grid-cols-2 gap-3'}
      role="list"
    >
      {children}
    </div>
  );
}
