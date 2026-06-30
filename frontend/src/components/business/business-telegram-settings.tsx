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
};

type Props = {
  panelBase: '/restaurant' | '/business';
};

export function BusinessTelegramSettingsView({ panelBase }: Props) {
  const { ready, authorized, token } = useRequireStaffRole({ roles: 'BUSINESS' });
  const qc = useQueryClient();
  const t = businessPanelI18n;
  const nav = businessPanelNav(panelBase);
  const [chatId, setChatId] = useState('');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () =>
      api<{ data: RestaurantRow[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurant = restaurants?.data?.[0];

  useEffect(() => {
    setChatId(restaurant?.telegramOrderChatId?.trim() ?? '');
  }, [restaurant?.telegramOrderChatId, restaurant?.id]);

  const save = useMutation({
    mutationFn: (body: { telegramOrderChatId: string | null }) =>
      api(`/restaurants/${restaurant!.id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants-admin'] });
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
        <p className="text-xs text-zinc-500">
          {restaurant.name} —{' '}
          {restaurant.telegramOrderChatId ? `ID: ${restaurant.telegramOrderChatId}` : '—'}
        </p>
      </div>
    </DashboardShell>
  );
}
