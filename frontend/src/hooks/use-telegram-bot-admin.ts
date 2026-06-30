'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type TelegramBotSettings = {
  welcomeMessage: string;
  siteUrl: string;
};

export type TelegramBotStats = {
  totalSubscribers: number;
  activeLast7Days: number;
  newToday: number;
  totalStarts: number;
};

export type TelegramWebhookStatus = {
  configured: boolean;
  registered: boolean;
  url: string | null;
  expectedUrl: string | null;
  lastErrorMessage?: string | null;
  pendingUpdateCount?: number;
  missingEnv: string[];
};

export type TelegramBotIdentity = {
  id: number;
  username: string;
  firstName: string;
  isBot: boolean;
};

export type TelegramBotDiagnostics = {
  usesSeparateMessagingToken: boolean;
  configuredUsername: string | null;
  messagingBot: TelegramBotIdentity | null;
  loginBot: TelegramBotIdentity | null;
  usernameMatchesMessaging: boolean;
  usernameMatchesLogin: boolean;
  openBotLink: string | null;
  note: string;
};

export type TelegramBotAdminPanel = {
  botConfigured: boolean;
  botUsername: string | null;
  webhookUrl: string | null;
  webhookStatus: TelegramWebhookStatus;
  botDiagnostics: TelegramBotDiagnostics;
  settings: TelegramBotSettings;
  stats: TelegramBotStats;
};

export function useTelegramBotAdmin() {
  const token = getToken();
  const qc = useQueryClient();

  const panel = useQuery({
    queryKey: ['telegram-bot-admin'],
    queryFn: () =>
      api<TelegramBotAdminPanel>('/telegram-bot/admin', { token: token ?? undefined }),
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: (body: Partial<TelegramBotSettings>) =>
      api<{ settings: TelegramBotSettings; stats: TelegramBotStats }>('/telegram-bot/admin', {
        method: 'PUT',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram-bot-admin'] });
    },
  });

  const registerWebhook = useMutation({
    mutationFn: () =>
      api<{ ok: boolean; error?: string; webhookStatus: TelegramWebhookStatus }>(
        '/telegram-bot/admin/register-webhook',
        { method: 'POST', token: token ?? undefined },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram-bot-admin'] });
    },
  });

  return { panel, save, registerWebhook };
}
