'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { useAdminSettings, type AdminSettings } from '@/hooks/use-admin-settings';
import { useDeliveryPricing } from '@/hooks/use-delivery-pricing';
import { LoadingState, EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Parse numeric text field; empty string becomes 0. */
function parseNumberInput(value: string): number {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return 0;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : 0;
}

/** Must be module-level — defining inside render remounts inputs on every keystroke. */
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function NumericField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-500">{label}</label>
      <Input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
      />
    </div>
  );
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
  const settingsLoaded = useRef(false);
  const pricingLoaded = useRef(false);

  useEffect(() => {
    if (!settings.data || settingsLoaded.current) return;
    setForm(settings.data);
    setMinOrderAmount(String(settings.data.min_order_amount ?? ''));
    setFreeDeliveryThreshold(String(settings.data.free_delivery_threshold ?? ''));
    settingsLoaded.current = true;
  }, [settings.data]);

  useEffect(() => {
    if (!pricing.data || pricingLoaded.current) return;
    setBaseDeliveryFee(String(pricing.data.baseDeliveryFee ?? 8000));
    setPerKmFee(String(pricing.data.perKmFee ?? 1500));
    setMaxDeliveryDistance(String(pricing.data.maxDeliveryDistance ?? 10));
    pricingLoaded.current = true;
  }, [pricing.data]);

  const submit = async () => {
    if (!form) return;

    const settingsPayload: Partial<AdminSettings> = {
      app_name: form.app_name,
      home_title: form.home_title,
      home_subtitle: form.home_subtitle,
      support_phone: form.support_phone,
      support_telegram: form.support_telegram,
      min_order_amount: parseNumberInput(minOrderAmount),
      free_delivery_threshold: parseNumberInput(freeDeliveryThreshold),
    };
    const email = form.support_email?.trim();
    if (email) settingsPayload.support_email = email;

    const pricingPayload = {
      ...(pricing.data ?? {}),
      baseDeliveryFee: parseNumberInput(baseDeliveryFee),
      perKmFee: parseNumberInput(perKmFee),
      maxDeliveryDistance: parseNumberInput(maxDeliveryDistance),
    };

    try {
      const savedSettings = await save.mutateAsync(settingsPayload);
      setForm(savedSettings);
      setMinOrderAmount(String(savedSettings.min_order_amount ?? ''));
      setFreeDeliveryThreshold(String(savedSettings.free_delivery_threshold ?? ''));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save settings');
      return;
    }

    try {
      const savedPricing = await savePricing.mutateAsync(pricingPayload);
      setBaseDeliveryFee(String(savedPricing.baseDeliveryFee));
      setPerKmFee(String(savedPricing.perKmFee));
      setMaxDeliveryDistance(String(savedPricing.maxDeliveryDistance));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save delivery pricing');
      return;
    }

    toast.success('Settings saved');
  };

  if (settings.isLoading || pricing.isLoading || !form) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Settings</h1>
        <Button type="button" onClick={submit} disabled={save.isPending || savePricing.isPending}>
          {save.isPending || savePricing.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <SettingsSection title="General">
        <Input
          placeholder="App name"
          value={form.app_name}
          onChange={(e) => setForm({ ...form, app_name: e.target.value })}
        />
      </SettingsSection>

      <SettingsSection title="Bosh sahifa">
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
      </SettingsSection>

      <SettingsSection title="Delivery pricing">
        <NumericField
          label="Base delivery fee (UZS)"
          placeholder="8000"
          value={baseDeliveryFee}
          onChange={setBaseDeliveryFee}
        />
        <NumericField
          label="Per km fee (UZS)"
          placeholder="1500"
          value={perKmFee}
          onChange={setPerKmFee}
        />
        <NumericField
          label="Max delivery distance (km)"
          placeholder="10"
          value={maxDeliveryDistance}
          onChange={setMaxDeliveryDistance}
        />
        <p className="sm:col-span-2 text-xs text-zinc-500">
          Formula: distance = Haversine × 1.3; fee = base + distance × perKm; rounded to nearest 500 UZS.
        </p>
        <NumericField
          label="Min order amount (UZS)"
          placeholder="30000"
          value={minOrderAmount}
          onChange={setMinOrderAmount}
        />
        <NumericField
          label="Free delivery threshold (UZS)"
          placeholder="100000"
          value={freeDeliveryThreshold}
          onChange={setFreeDeliveryThreshold}
        />
      </SettingsSection>

      <SettingsSection title="Support">
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
      </SettingsSection>
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
