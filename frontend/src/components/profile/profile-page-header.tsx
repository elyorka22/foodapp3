'use client';

import Image from 'next/image';
import { UserCircle } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  name: string;
  photoUrl?: string | null;
  badgeCount?: number;
};

export function ProfilePageHeader({ name, photoUrl, badgeCount }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <header className="flex flex-col items-center pt-2 text-center">
      <div className="relative">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            width={88}
            height={88}
            className="h-[88px] w-[88px] rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-primary-soft">
            {name === uz.profileGuestName || name === uz.guestUserTitle ? (
              <span className="text-3xl font-bold text-primary">{initial}</span>
            ) : (
              <UserCircle size={48} className="text-primary" strokeWidth={1.5} />
            )}
          </div>
        )}
        {badgeCount != null && badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-[#F5F5F7] bg-[#FFC107] px-1.5 text-[11px] font-bold text-zinc-900">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[13px] text-zinc-500">{uz.profileAccount}</p>
      <h1 className="mt-1 max-w-full truncate text-[28px] font-extrabold leading-tight tracking-tight text-zinc-900">
        {name}
      </h1>
    </header>
  );
}
