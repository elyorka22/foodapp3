import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TelegramBotSettings {
  welcomeMessage: string;
  siteUrl: string;
}

export interface TelegramBotStats {
  totalSubscribers: number;
  activeLast7Days: number;
  newToday: number;
  totalStarts: number;
}

const SETTINGS_KEY = 'telegram_bot_settings';

const DEFAULT_SETTINGS: TelegramBotSettings = {
  welcomeMessage:
    "Assalomu alaykum! FoodApp ga xush kelibsiz.\n\nBuyurtma berish uchun saytimizga o'ting:",
  siteUrl: 'https://foodapp.uz',
};

@Injectable()
export class TelegramBotSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<TelegramBotSettings> {
    const row = await this.prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row?.value || typeof row.value !== 'object') return { ...DEFAULT_SETTINGS };
    const stored = row.value as Partial<Record<string, string>>;
    return {
      welcomeMessage:
        typeof stored.welcomeMessage === 'string' && stored.welcomeMessage.trim()
          ? stored.welcomeMessage.trim()
          : DEFAULT_SETTINGS.welcomeMessage,
      siteUrl:
        typeof stored.siteUrl === 'string' && stored.siteUrl.trim()
          ? stored.siteUrl.trim()
          : DEFAULT_SETTINGS.siteUrl,
    };
  }

  async setSettings(
    patch: Partial<TelegramBotSettings>,
    userId?: string,
  ): Promise<TelegramBotSettings> {
    const current = await this.getSettings();
    const next: TelegramBotSettings = {
      welcomeMessage: patch.welcomeMessage?.trim() || current.welcomeMessage,
      siteUrl: patch.siteUrl?.trim() || current.siteUrl,
    };
    await this.prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        group: 'telegram',
        value: next as object,
      },
      update: { value: next as object, group: 'telegram' },
    });
    if (userId) {
      // audit optional — keep module lean
    }
    return next;
  }

  async getStats(): Promise<TelegramBotStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [totalSubscribers, activeLast7Days, newToday, startsAgg] = await Promise.all([
      this.prisma.telegramBotSubscriber.count(),
      this.prisma.telegramBotSubscriber.count({
        where: { lastStartedAt: { gte: weekAgo } },
      }),
      this.prisma.telegramBotSubscriber.count({
        where: { firstStartedAt: { gte: todayStart } },
      }),
      this.prisma.telegramBotSubscriber.aggregate({ _sum: { startCount: true } }),
    ]);

    return {
      totalSubscribers,
      activeLast7Days,
      newToday,
      totalStarts: startsAgg._sum.startCount ?? 0,
    };
  }
}
