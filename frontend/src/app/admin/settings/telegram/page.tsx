'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { LoadingState, StatCard } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useTelegramBotAdmin } from '@/hooks/use-telegram-bot-admin';

export default function AdminTelegramBotSettingsPage() {
  const { panel, save } = useTelegramBotAdmin();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    if (panel.data?.settings) {
      setWelcomeMessage(panel.data.settings.welcomeMessage);
      setSiteUrl(panel.data.settings.siteUrl);
    }
  }, [panel.data?.settings]);

  if (panel.isLoading) return <LoadingState label={t.loading} />;

  if (panel.isError) {
    return (
      <AdminPageGuard permission="settings">
        <p className="text-sm text-red-600">
          {panel.error instanceof Error ? panel.error.message : t.noData}
        </p>
      </AdminPageGuard>
    );
  }

  const data = panel.data!;

  return (
    <AdminPageGuard permission="settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold">{t.telegramBot.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">{t.telegramBot.subtitle}</p>
        </div>

        {!data.botConfigured ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            {t.telegramBot.botNotConfigured}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t.telegramBot.totalSubscribers} value={data.stats.totalSubscribers} />
          <StatCard label={t.telegramBot.activeLast7Days} value={data.stats.activeLast7Days} />
          <StatCard label={t.telegramBot.newToday} value={data.stats.newToday} />
          <StatCard label={t.telegramBot.totalStarts} value={data.stats.totalStarts} />
        </div>

        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">{t.telegramBot.statsTitle}</p>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">{t.telegramBot.botUsername}</dt>
              <dd className="font-mono">{data.botUsername ? `@${data.botUsername}` : '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">{t.telegramBot.webhookUrl}</dt>
              <dd className="break-all font-mono text-xs">{data.webhookUrl ?? '—'}</dd>
              <p className="mt-1 text-xs text-zinc-500">{t.telegramBot.webhookHint}</p>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <div className="grid gap-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{t.telegramBot.welcomeMessage}</span>
              <textarea
                className="min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{t.telegramBot.siteUrl}</span>
              <Input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://"
              />
            </label>
            <div>
              <Button
                type="button"
                disabled={save.isPending}
                onClick={async () => {
                  try {
                    await save.mutateAsync({
                      welcomeMessage: welcomeMessage.trim(),
                      siteUrl: siteUrl.trim(),
                    });
                    toast.success(t.telegramBot.saved);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Xatolik');
                  }
                }}
              >
                {t.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageGuard>
  );
}
