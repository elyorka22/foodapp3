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
  const { panel, save, registerWebhook } = useTelegramBotAdmin();
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
  const webhookStatus = data.webhookStatus;
  const diag = data.botDiagnostics;

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

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100">
          <p>{t.telegramBot.botOneTokenNote}</p>
          {diag.openBotLink ? (
            <p className="mt-2">
              <span className="font-medium">{t.telegramBot.botOpenThis}: </span>
              <a href={diag.openBotLink} target="_blank" rel="noopener noreferrer" className="underline">
                @{diag.messagingBot?.username}
              </a>
            </p>
          ) : null}
          {!diag.usernameMatchesMessaging ? (
            <p className="mt-2 font-medium text-red-700">{t.telegramBot.botTokenMismatch}</p>
          ) : null}
        </div>

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
            <div>
              <dt className="text-zinc-500">{t.telegramBot.botMessagingBot}</dt>
              <dd className="font-mono">
                {diag.messagingBot ? `@${diag.messagingBot.username}` : '—'}
              </dd>
            </div>
            {diag.loginBot && diag.loginBot.username !== diag.messagingBot?.username ? (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">{t.telegramBot.botLoginBot}</dt>
                <dd className="font-mono text-amber-800">@{diag.loginBot.username}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-zinc-500">Webhook</dt>
              <dd className={webhookStatus.registered ? 'text-green-700' : 'text-amber-700'}>
                {webhookStatus.registered ? t.telegramBot.webhookRegistered : t.telegramBot.webhookNotRegistered}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">{t.telegramBot.webhookUrl}</dt>
              <dd className="break-all font-mono text-xs">{data.webhookUrl ?? '—'}</dd>
              <p className="mt-1 text-xs text-zinc-500">{t.telegramBot.webhookHint}</p>
            </div>
            {webhookStatus.missingEnv.length > 0 ? (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">{t.telegramBot.missingEnv}</dt>
                <dd className="font-mono text-xs text-amber-800">{webhookStatus.missingEnv.join(', ')}</dd>
              </div>
            ) : null}
            {webhookStatus.lastErrorMessage ? (
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">{t.telegramBot.webhookLastError}</dt>
                <dd className="text-xs text-red-700">{webhookStatus.lastErrorMessage}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={registerWebhook.isPending || !data.botConfigured}
              onClick={async () => {
                try {
                  const result = await registerWebhook.mutateAsync();
                  if (result.ok) toast.success(t.telegramBot.webhookRegisteredOk);
                  else toast.error(result.error ?? t.telegramBot.webhookRegisterFailed);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : t.telegramBot.webhookRegisterFailed);
                }
              }}
            >
              {t.telegramBot.webhookRegister}
            </Button>
          </div>
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
