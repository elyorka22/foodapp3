'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminSettings, type AdminSettings } from '@/hooks/use-admin-settings';
import { useDeliveryPricing } from '@/hooks/use-delivery-pricing';
import { AdminImageFramingSettings } from '@/components/admin/admin-image-framing-settings';
import { LoadingState, EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AdminSettingsContent() {
  const { settings, save } = useAdminSettings();
  const { pricing, save: savePricing } = useDeliveryPricing();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [pricePerKm, setPricePerKm] = useState(3000);
  const [minDeliveryFee, setMinDeliveryFee] = useState(0);
  const [roadDistanceFactor, setRoadDistanceFactor] = useState(1.35);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  useEffect(() => {
    if (pricing.data) {
      setPricePerKm(pricing.data.pricePerKm);
      setMinDeliveryFee(pricing.data.minDeliveryFee ?? 0);
      setRoadDistanceFactor(pricing.data.roadDistanceFactor ?? 1.35);
    }
  }, [pricing.data]);

  const submit = async () => {
    if (!form) return;
    try {
      await Promise.all([
        save.mutateAsync(form),
        savePricing.mutateAsync({
          ...(pricing.data ?? {}),
          pricePerKm,
          minDeliveryFee,
          roadDistanceFactor,
          baseFee: 0,
        }),
      ]);
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

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">Rasmlar — banner va restoran kartochkalari</p>
        <p className="mb-4 text-xs text-zinc-500">
          Standart masshtab va joylashuv. Har bir banner yoki restoranda alohida sozlash mumkin.
        </p>
        <AdminImageFramingSettings form={form} setForm={setForm} />
      </div>

      <Section title="Delivery">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-zinc-500">
            Base price per kilometer (UZS) — billable_km × this value, rounded to 500
          </label>
          <Input
            type="number"
            placeholder="3000"
            value={pricePerKm}
            onChange={(e) => setPricePerKm(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Road distance factor (1.35 = +35% on straight-line km)
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="1.35"
            value={roadDistanceFactor}
            onChange={(e) => setRoadDistanceFactor(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Minimum delivery fee (UZS)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={minDeliveryFee}
            onChange={(e) => setMinDeliveryFee(Number(e.target.value))}
          />
        </div>
        <Input
          type="number"
          placeholder="Min order amount"
          value={form.min_order_amount}
          onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
        />
        <Input
          type="number"
          placeholder="Free delivery threshold"
          value={form.free_delivery_threshold}
          onChange={(e) => setForm({ ...form, free_delivery_threshold: Number(e.target.value) })}
        />
      </Section>

      <Section title="Payments">
        <Input
          type="number"
          placeholder="Default commission %"
          value={form.commission_default}
          onChange={(e) => setForm({ ...form, commission_default: Number(e.target.value) })}
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
