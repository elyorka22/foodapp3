'use client';

import { ChevronDown, MapPin } from 'lucide-react';

export function DeliveryAddressBar() {
  return (
    <button
      type="button"
      className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <MapPin size={22} strokeWidth={2} fill="currentColor" className="opacity-90" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">Yetkazish manzili</p>
        <p className="truncate text-[15px] font-bold text-zinc-900">Amir Temur ko&apos;chasi, 12</p>
      </div>
      <ChevronDown size={20} className="shrink-0 text-zinc-400" />
    </button>
  );
}
