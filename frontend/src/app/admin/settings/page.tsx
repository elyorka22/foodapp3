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
  const [pricePerKm, setPricePerKm] = useState('');
  const [minDeliveryFee, setMinDeliveryFee] = useState('');
  const [roadDistanceFactor, setRoadDistanceFactor] = useState('');
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
    setPricePerKm(String(pricing.data.pricePerKm));
    setMinDeliveryFee(String(pricing.data.minDeliveryFee ?? 0));
    setRoadDistanceFactor(String(pricing.data.roadDistanceFactor ?? 1.35));
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
          pricePerKm: parseNumberInput(pricePerKm, 3000),
          minDeliveryFee: parseNumberInput(minDeliveryFee, 0),
          roadDistanceFactor: parseNumberInput(roadDistanceFactor, 1.35),
          baseFee: 0,
        }),
      ]);
      setForm(savedSettings);
      setMinOrderAmount(String(savedSettings.min_order_amount ?? ''));
      setFreeDeliveryThreshold(String(savedSettings.free_delivery_threshold ?? ''));
      setPricePerKm(String(savedPricing.pricePerKm));
      setMinDeliveryFee(String(savedPricing.minDeliveryFee ?? 0));
      setRoadDistanceFactor(String(savedPricing.roadDistanceFactor ?? 1.35));
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

      <Section title="Delivery">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-zinc-500">
            Base price per kilometer (UZS) — billable_km × this value, rounded to 500
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="3000"
            value={pricePerKm}
            onChange={(e) => setPricePerKm(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Road distance factor (1.35 = +35% on straight-line km)
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="1.35"
            value={roadDistanceFactor}
            onChange={(e) => setRoadDistanceFactor(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Minimum delivery fee (UZS)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={minDeliveryFee}
            onChange={(e) => setMinDeliveryFee(e.target.value)}
          />
        </div>
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
