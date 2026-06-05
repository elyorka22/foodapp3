'use client';

import { Input } from '@/components/ui/input';

type LocationForm = {
  branchAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function MerchantLocationFields<T extends LocationForm>({
  form,
  setForm,
}: {
  form: T;
  setForm: (f: T) => void;
}) {
  const lat = form.latitude ?? '';
  const lng = form.longitude ?? '';

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-600">
      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        Delivery location (required for automatic delivery fee)
      </p>
      <p className="text-xs text-zinc-500">
        Enter coordinates manually or copy from a map. Used to calculate distance to the customer.
      </p>
      <Input
        placeholder="Branch address"
        value={form.branchAddress ?? ''}
        onChange={(e) => setForm({ ...form, branchAddress: e.target.value })}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude (e.g. 41.0020)"
          value={lat}
          onChange={(e) =>
            setForm({
              ...form,
              latitude: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude (e.g. 71.2400)"
          value={lng}
          onChange={(e) =>
            setForm({
              ...form,
              longitude: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
      </div>
      {form.latitude != null && form.longitude != null && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${form.latitude}&mlon=${form.longitude}#map=16/${form.latitude}/${form.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 hover:underline"
        >
          Preview on map
        </a>
      )}
    </div>
  );
}
