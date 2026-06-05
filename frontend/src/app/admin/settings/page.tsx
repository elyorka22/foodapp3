'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { useAdminSettings, type AdminSettings } from '@/hooks/use-admin-settings';
import { useDeliveryPricing } from '@/hooks/use-delivery-pricing';
import { LoadingState, EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function parseNumberInput(value: string, fallback = 0): number {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : fallback;
}

function AdminSettingsContent() {
  const { settings, save } = useAdminSettings();
  const { pricing, save: savePricing } = useDeliveryPricing();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState('');
  const [perKmFee, setPerKmFee] = useState('');
  const [maxDeliveryDistance, setMaxDeliveryDistance] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const settingsHydrated = useRef(false);
  const pricingHydrated = useRef(false);

  useEffect(() => {
    if (!settings.data || settingsHydrated.current) return;
    setForm(settings.data);
    setMinOrderAmount(String(settings.data.min_order_amount ?? ''));
    setFreeDeliveryThreshold(String(settings.data.free_delivery_threshold ?? ''));
    settingsHydrated.current = true;
  }, [settings.data]);

  useEffect(() => {
    if (!pricing.data || pricingHydrated.current) return;
    setBaseDeliveryFee(String(pricing.data.baseDeliveryFee ?? 8000));
    setPerKmFee(String(pricing.data.perKmFee ?? 1500));
    setMaxDeliveryDistance(String(pricing.data.maxDeliveryDistance ?? 10));
    pricingHydrated.current = true;
  }, [pricing.data]);

  const submit = async () => {
    if (!form) return;
    try {
      const payload: AdminSettings = {
        ...form,
        min_order_amount: parseNumberInput(minOrderAmount, form.min_order_amount),
        free_delivery_threshold: parseNumberInput(freeDeliveryThreshold, form.free_delivery_threshold),
      };
      const [savedSettings, savedPricing] = await Promise.all([
        save.mutateAsync(payload),
        savePricing.mutateAsync({
          ...(pricing.data ?? {}),
          baseDeliveryFee: parseNumberInput(baseDeliveryFee, 8000),
          perKmFee: parseNumberInput(perKmFee, 1500),
          maxDeliveryDistance: parseNumberInput(maxDeliveryDistance, 10),
        }),
      ]);
      setForm(savedSettings);
      setMinOrderAmount(String(savedSettings.min_order_amount ?? ''));
      setFreeDeliveryThreshold(String(savedSettings.free_delivery_threshold ?? ''));
      setBaseDeliveryFee(String(savedPricing.baseDeliveryFee));
      setPerKmFee(String(savedPricing.perKmFee));
      setMaxDeliveryDistance(String(savedPricing.maxDeliveryDistance));
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  if (settings.isLoading || !form) {
    return <LoadingState label="Loading settings..." />;
  }

  if (settings.isError) {
    return (
      <EmptyState
        title="Failed to load settings"
        description={settings.error instanceof Error ? settings.error.message : 'Unknown error'}
      />
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Settings</h1>
        <Button type="button" onClick={submit} disabled={save.isPending}>
          {save.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Section title="General">
        <Input
          placeholder="App name"
          value={form.app_name}
          onChange={(e) => setForm({ ...form, app_name: e.target.value })}
        />
      </Section>

      <Section title="Bosh sahifa">
        <Input
          placeholder="Sarlavha (masalan: CHUST)"
          value={form.home_title ?? ''}
          onChange={(e) => setForm({ ...form, home_title: e.target.value })}
        />
        <Input
          placeholder="Pastki qator (ixtiyoriy)"
          value={form.home_subtitle ?? ''}
          onChange={(e) => setForm({ ...form, home_subtitle: e.target.value })}
        />
      </Section>

      <Section title="Delivery pricing">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Base delivery fee (UZS)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="8000"
            value={baseDeliveryFee}
            onChange={(e) => setBaseDeliveryFee(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Per km fee (UZS)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="1500"
            value={perKmFee}
            onChange={(e) => setPerKmFee(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Max delivery distance (km)
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="10"
            value={maxDeliveryDistance}
            onChange={(e) => setMaxDeliveryDistance(e.target.value)}
          />
        </div>
        <p className="sm:col-span-2 text-xs text-zinc-500">
          Formula: distance = Haversine × 1.3; fee = base + distance × perKm; rounded to nearest 500 UZS.
        </p>
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Min order amount"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
        />
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Free delivery threshold"
          value={freeDeliveryThreshold}
          onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
        />
      </Section>

      <Section title="Support">
        <Input
          placeholder="Support phone"
          value={form.support_phone}
          onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
        />
        <Input
          placeholder="Support Telegram"
          value={form.support_telegram}
          onChange={(e) => setForm({ ...form, support_telegram: e.target.value })}
        />
        <Input
          placeholder="Support email"
          value={form.support_email}
          onChange={(e) => setForm({ ...form, support_email: e.target.value })}
        />
      </Section>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminPageGuard permission="settings">
      <AdminSettingsContent />
    </AdminPageGuard>
  );
}
