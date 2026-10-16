'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useSelectedCity } from '@/hooks/use-selected-city';
import { uz } from '@/lib/uz';
import type { City } from '@/hooks/use-cities';

type CitySelectorProps = {
  className?: string;
};

export function CitySelector({ className }: CitySelectorProps) {
  const { cities, selectedCity, selectCity, isLoading } = useSelectedCity();
  const [open, setOpen] = useState(false);
  const centered = Boolean(className?.includes('home-city-center'));

  const label = selectedCity?.name ?? uz.cityName;
  const canPick = cities.length > 1;

  if (isLoading || !canPick) {
    return (
      <span
        className={clsx(
          'truncate font-extrabold leading-tight tracking-tight text-zinc-900',
          centered ? 'text-[22px]' : 'text-[26px]',
          isLoading && 'opacity-70',
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <div className={clsx('relative', centered && 'flex justify-center', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'group flex max-w-full items-center gap-1 text-left',
          centered && 'justify-center',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className={clsx(
            'truncate font-extrabold leading-tight tracking-tight text-zinc-900',
            centered ? 'text-[22px]' : 'text-[26px]',
          )}
        >
          {label}
        </span>
        <ChevronDown
          size={centered ? 18 : 22}
          strokeWidth={2.5}
          className={clsx(
            'shrink-0 text-zinc-700 transition-transform duration-200',
            centered ? 'mt-0.5' : 'mt-1',
            open && 'rotate-180',
          )}
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
            centered={centered}
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
  centered,
  onSelect,
}: {
  cities: City[];
  selectedSlug?: string;
  centered?: boolean;
  onSelect: (city: City) => void;
}) {
  if (!cities.length) {
    return (
      <div
        className={clsx(
          'absolute top-full z-50 mt-2 min-w-[200px] rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-500 shadow-lg',
          centered ? 'left-1/2 -translate-x-1/2' : 'left-0',
        )}
      >
        Shaharlar ro‘yxati bo‘sh
      </div>
    );
  }

  return (
    <ul
      role="listbox"
      className={clsx(
        'absolute top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1.5 shadow-lg',
        centered ? 'left-1/2 -translate-x-1/2' : 'left-0',
      )}
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
              className={clsx(
                'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-semibold transition hover:bg-zinc-50',
                selected ? 'text-zinc-900' : 'text-zinc-700',
              )}
            >
              <span>{city.name}</span>
              {selected ? <Check size={18} className="shrink-0 text-zinc-900" strokeWidth={2.5} /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
