'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useSelectedCity } from '@/hooks/use-selected-city';
import { uz } from '@/lib/uz';
import type { City } from '@/hooks/use-cities';

type CitySelectorProps = {
  className?: string;
};

export function CitySelector({ className }: CitySelectorProps) {
  const { cities, selectedCity, selectCity, isLoading } = useSelectedCity();
  const [open, setOpen] = useState(false);

  const label = selectedCity?.name ?? uz.cityName;
  const canPick = cities.length > 1;

  if (isLoading) {
    return <div className={`h-9 w-36 animate-pulse rounded-lg bg-zinc-200/80 ${className ?? ''}`} />;
  }

  if (!canPick) {
    return (
      <span className={`truncate text-[26px] font-bold leading-tight tracking-tight text-zinc-900 ${className ?? ''}`}>
        {label}
      </span>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex max-w-full items-center gap-1.5 text-left"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate text-[26px] font-bold leading-tight tracking-tight text-zinc-900">
          {label}
        </span>
        <ChevronDown
          size={22}
          strokeWidth={2.5}
          className={`mt-1 shrink-0 text-zinc-800 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Yopish"
            onClick={() => setOpen(false)}
          />
          <CityList
            cities={cities}
            selectedSlug={selectedCity?.slug}
            onSelect={(city) => {
              selectCity(city);
              setOpen(false);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

function CityList({
  cities,
  selectedSlug,
  onSelect,
}: {
  cities: City[];
  selectedSlug?: string;
  onSelect: (city: City) => void;
}) {
  if (!cities.length) {
    return (
      <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-500 shadow-lg">
        Shaharlar ro‘yxati bo‘sh
      </div>
    );
  }

  return (
    <ul
      role="listbox"
      className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1.5 shadow-lg"
    >
      {cities.map((city) => {
        const selected = city.slug === selectedSlug;
        return (
          <li key={city.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(city)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-semibold transition hover:bg-zinc-50 ${
                selected ? 'text-zinc-900' : 'text-zinc-700'
              }`}
            >
              <span>{city.name}</span>
              {selected ? <Check size={18} className="shrink-0 text-[#FF6B00]" strokeWidth={2.5} /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
