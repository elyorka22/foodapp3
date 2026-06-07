'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { StatCard, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminPush, type PushAudience, type PushSendForm } from '@/hooks/use-admin-push';

const AUDIENCE_LABELS: Record<PushAudience, string> = {
  CUSTOMERS: t.push.audienceCustomers,
  COURIERS: t.push.audienceCouriers,
  STAFF: t.push.audienceStaff,
  ALL: t.push.audienceAll,
  USER: t.push.audienceUser,
};

function AdminPushContent() {
  const { isSuperAdmin } = useAdminAccess({ permission: 'notifications' });
  const { audiences, stats, send } = useAdminPush();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState<PushSendForm>({
    audience: 'CUSTOMERS',
    title: '',
    body: '',
    templateCode: 'SYSTEM',
  });

  const allowedAudiences = audiences.data?.audiences ?? [];

  const audienceOptions = useMemo(
    () => allowedAudiences.map((value) => ({ value, label: AUDIENCE_LABELS[value] })),
    [allowedAudiences],
  );

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Sarlavha va matn to‘ldirilishi shart');
      return;
    }
    if (form.audience === 'USER' && !form.userId?.trim()) {
      toast.error('Foydalanuvchi ID kiritilishi shart');
      return;
    }
    try {
      const result = await send.mutateAsync({
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        userId: form.userId?.trim() || undefined,
        accountType:
          form.audience === 'USER'
            ? form.accountType ?? 'CUSTOMER'
            : undefined,
      });
      setConfirmOpen(false);
      toast.success(
        `${t.push.success}: ${result.delivered}/${result.recipients} qabul qilindi`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Yuborishda xatolik');
    }
  };

  if (audiences.isLoading || stats.isLoading) {
    return <LoadingState label={t.loading} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold">{t.push.title}</h1>
        <p className="mt-1 text-sm opacity-70">{t.push.subtitle}</p>
      </div>

      {stats.data && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label={t.push.statsCustomers}
            value={stats.data.customers.users}
            subLabel={`${stats.data.customers.devicesWithToken} ${t.push.statsWithToken}`}
          />
          <StatCard
            label={t.push.statsCouriers}
            value={stats.data.couriers.users}
            subLabel={`${stats.data.couriers.devicesWithToken} ${t.push.statsWithToken}`}
          />
          <StatCard
            label={t.push.statsStaff}
            value={stats.data.staff.users}
            subLabel={`${stats.data.staff.devicesWithToken} ${t.push.statsWithToken}`}
          />
        </div>
      )}

      <form
        className="space-y-4 rounded-xl border p-4 dark:border-white/10"
        onSubmit={(e) => {
          e.preventDefault();
          setConfirmOpen(true);
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t.push.audience}</span>
          <select
            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-white/10"
            value={form.audience}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                audience: e.target.value as PushAudience,
              }))
            }
          >
            {audienceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {form.audience === 'USER' && (
          <>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{t.push.accountTypeLabel}</span>
              <select
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-white/10"
                value={form.accountType ?? 'CUSTOMER'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accountType: e.target.value as 'CUSTOMER' | 'STAFF',
                  }))
                }
              >
                <option value="CUSTOMER">{t.push.accountCustomer}</option>
                <option value="STAFF">{t.push.accountStaff}</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{t.push.userIdLabel}</span>
              <Input
                value={form.userId ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                placeholder="UUID"
              />
            </label>
          </>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Tur</span>
          <select
            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-white/10"
            value={form.templateCode ?? 'SYSTEM'}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                templateCode: e.target.value as 'SYSTEM' | 'PROMOTION',
              }))
            }
          >
            <option value="SYSTEM">{t.push.templateSystem}</option>
            <option value="PROMOTION">{t.push.templatePromotion}</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t.push.titleLabel}</span>
          <Input
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">{t.push.bodyLabel}</span>
          <textarea
            className="min-h-24 w-full rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-white/10"
            value={form.body}
            maxLength={500}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
          />
        </label>

        {!isSuperAdmin && (
          <p className="text-xs opacity-60">
            Menejer: faqat mijozlar, kuryerlar va bitta foydalanuvchi.
          </p>
        )}

        <Button type="submit" disabled={send.isPending}>
          {send.isPending ? t.push.sending : t.push.send}
        </Button>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title={t.push.confirmSend}
        description={`${AUDIENCE_LABELS[form.audience]} — «${form.title}»`}
        onConfirm={submit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default function AdminPushPage() {
  return (
    <AdminPageGuard permission="notifications">
      <AdminPushContent />
    </AdminPageGuard>
  );
}
