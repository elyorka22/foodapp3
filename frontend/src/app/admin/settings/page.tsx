'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminSettings, type AdminSettings } from '@/hooks/use-admin-settings';
import { LoadingState, EmptyState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AdminSettingsContent() {
  const { settings, save } = useAdminSettings();
  const [form, setForm] = useState<AdminSettings | null>(null);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const submit = async () => {
    if (!form) return;
    try {
      await save.mutateAsync(form);
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
        <Input
          type="number"
          placeholder="Default delivery fee"
          value={form.default_delivery_fee}
          onChange={(e) => setForm({ ...form, default_delivery_fee: Number(e.target.value) })}
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
