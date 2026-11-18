import type { ReactNode } from 'react';

export function ProfileMenuGroup({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}
