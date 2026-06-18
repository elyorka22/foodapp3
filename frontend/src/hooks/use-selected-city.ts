'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSelectedCitySlug, setSelectedCitySlug } from '@/lib/city-selection';
import { useCities, type City } from '@/hooks/use-cities';

function pickDefaultCity(cities: City[]): City | null {
  if (!cities.length) return null;
  const stored = getSelectedCitySlug();
  if (stored) {
    const match = cities.find((c) => c.slug === stored);
    if (match) return match;
  }
  return cities.find((c) => c.isDefault) ?? cities[0];
}

export function useSelectedCity() {
  const citiesQuery = useCities();
  const cities = citiesQuery.data ?? [];
  const [selectedSlug, setSelectedSlugState] = useState<string | null>(null);

  useEffect(() => {
    if (!cities.length) return;
    const initial = pickDefaultCity(cities);
    if (initial) {
      setSelectedSlugState(initial.slug);
      if (!getSelectedCitySlug()) {
        setSelectedCitySlug(initial.slug);
      }
    }
  }, [cities]);

  const selectedCity = useMemo(() => {
    if (!cities.length) return null;
    const slug = selectedSlug ?? getSelectedCitySlug();
    if (slug) {
      const match = cities.find((c) => c.slug === slug);
      if (match) return match;
    }
    return pickDefaultCity(cities);
  }, [cities, selectedSlug]);

  const selectCity = useCallback((city: City) => {
    setSelectedCitySlug(city.slug);
    setSelectedSlugState(city.slug);
  }, []);

  return {
    cities,
    selectedCity,
    selectCity,
    isLoading: citiesQuery.isLoading,
    isError: citiesQuery.isError,
  };
}
