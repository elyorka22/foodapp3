'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/admin/ui';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { businessPanelNav } from '@/lib/business-panel-nav';

type RestaurantRow = {
  id: string;
  name: string;
  telegramOrderChatId?: string | null;
  telegramLinkCode?: string | null;
  telegramLinkExpiresAt?: string | null;
};

type TelegramLinkStatus = {
  isLinked: boolean;
  telegramOrderChatId: string | null;
  pendingCode: string | null;
  pendingExpiresAt: string | null;
};

type Props = {
  panelBase: '/restaurant' | '/business';
};

function formatCountdown(expiresAt: string | null | undefined): string {
  if (!expiresAt) return '';
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function BusinessTelegramSettingsView({ panelBase }: Props) {
  const { ready, authorized, token } = useRequireStaffRole({ roles: 'BUSINESS' });
  const qc = useQueryClient();
  const t = businessPanelI18n;
  const nav = businessPanelNav(panelBase);
  const [chatId, setChatId] = useState('');
  const [countdown, setCountdown] = useState('');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () =>
      api<{ data: RestaurantRow[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
    refetchInterval: 3000,
  });

  const restaurant = restaurants?.data?.[0];

  const { data: linkStatus } = useQuery({
    queryKey: ['telegram-link', restaurant?.id],
    queryFn: () =>
      api<TelegramLinkStatus>(`/restaurants/${restaurant!.id}/telegram-link`, {
        token: token ?? undefined,
      }),
    enabled: !!token && authorized && !!restaurant?.id,
    refetchInterval: 3000,
  });

  const pendingCode = linkStatus?.pendingCode ?? restaurant?.telegramLinkCode ?? null;
  const pendingExpiresAt =
    linkStatus?.pendingExpiresAt ?? restaurant?.telegramLinkExpiresAt ?? null;
  const isLinked = Boolean(
    linkStatus?.isLinked ?? restaurant?.telegramOrderChatId?.trim(),
  );

  useEffect(() => {
    setChatId(restaurant?.telegramOrderChatId?.trim() ?? '');
  }, [restaurant?.telegramOrderChatId, restaurant?.id]);

  useEffect(() => {
    if (!pendingExpiresAt) {
      setCountdown('');
      return;
    }
    const tick = () => setCountdown(formatCountdown(pendingExpiresAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [pendingExpiresAt]);

  const save = useMutation({
    mutationFn: (body: { telegramOrderChatId: string | null }) =>
      api(`/restaurants/${restaurant!.id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants-admin'] });
      qc.invalidateQueries({ queryKey: ['telegram-link', restaurant?.id] });
    },
  });

  if (!ready || isLoading) {
    return (
      <DashboardShell title={t.telegram.title} nav={nav}>
        <LoadingState label={t.loading} />
      </DashboardShell>
    );
  }

  if (!authorized || !restaurant) {
    return (
      <DashboardShell title={t.telegram.title} nav={nav}>
        <p className="text-sm text-zinc-500">{t.noRestaurantLinked}</p>
      </DashboardShell>
    );
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
  const botUrl = botUsername ? `https://t.me/${botUsername}` : null;

  return (
    <DashboardShell title={t.telegram.title} nav={nav}>
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-sm text-zinc-500">{t.telegram.hint}</p>
        <pre className="whitespace-pre-wrap rounded-xl bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {t.telegram.howTo}
        </pre>
        {botUrl ? (
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-brand-600 underline"
          >
            {t.telegram.botLink}
          </a>
        ) : null}

        {isLinked ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            {t.telegram.linked} — Chat ID: {linkStatus?.telegramOrderChatId ?? chatId}
          </div>
        ) : null}

        {pendingCode ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {t.telegram.pairingCode}
            </p>
            <p className="mt-2 text-center font-mono text-3xl font-bold tracking-[0.3em] text-amber-950 dark:text-amber-50">
              {pendingCode}
            </p>
            {countdown ? (
              <p className="mt-2 text-center text-xs text-amber-800 dark:text-amber-200">
                {t.telegram.codeExpires}: {countdown}
              </p>
            ) : null}
          </div>
        ) : !isLinked ? (
          <p className="text-sm text-zinc-500">{t.telegram.waitingForBot}</p>
        ) : null}

        <details className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <summary className="cursor-pointer text-sm font-medium">{t.telegram.manualTitle}</summary>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">{t.telegram.chatId}</span>
              <Input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder={t.telegram.chatIdPlaceholder}
                inputMode="numeric"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={save.isPending}
                onClick={async () => {
                  try {
                    await save.mutateAsync({
                      telegramOrderChatId: chatId.trim() || null,
                    });
                    toast.success(t.telegram.saved);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Xatolik');
                  }
                }}
              >
                {t.telegram.save}
              </Button>
              {restaurant.telegramOrderChatId ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={save.isPending}
                  onClick={async () => {
                    try {
                      await save.mutateAsync({ telegramOrderChatId: null });
                      setChatId('');
                      toast.success(t.telegram.cleared);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Xatolik');
                    }
                  }}
                >
                  {t.telegram.disable}
                </Button>
              ) : null}
            </div>
          </div>
        </details>

        <p className="text-xs text-zinc-500">{restaurant.name}</p>
      </div>
    </DashboardShell>
  );
}
