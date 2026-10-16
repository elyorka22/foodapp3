'use client';

import { useAdminCities } from '@/hooks/use-admin-cities';

type Props = {
  cityId?: string;
  onChange: (cityId: string) => void;
};

export function MerchantCityField({ cityId, onChange }: Props) {
  const { list } = useAdminCities();
  const cities = (list.data ?? []).filter((c) => c.isActive);

  return (
    <label className="block text-xs font-medium opacity-70">
      Shahar *
      <select
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        value={cityId ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Tanlang…</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.isDefault ? ' (asosiy)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
