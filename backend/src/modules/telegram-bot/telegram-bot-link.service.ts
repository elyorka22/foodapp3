import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BusinessApprovalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const TG_LINK_PICK_PREFIX = 'link_pick:';
export const TG_LINK_PAGE_PREFIX = 'link_page:';

const CODE_TTL_MS = 15 * 60 * 1000;
const PICKER_PAGE_SIZE = 8;

export type TelegramLinkStatus = {
  isLinked: boolean;
  telegramOrderChatId: string | null;
  pendingCode: string | null;
  pendingExpiresAt: string | null;
};

export type LinkCodeVerifyResult = 'ok' | 'invalid' | 'expired' | 'no_session';

@Injectable()
export class TelegramBotLinkService {
  private readonly logger = new Logger(TelegramBotLinkService.name);

  constructor(private prisma: PrismaService) {}

  async getLinkStatus(businessId: string): Promise<TelegramLinkStatus> {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      select: { telegramOrderChatId: true },
    });
    if (!business) throw new NotFoundException('Restaurant not found');

    const pending = await this.findActiveCode(businessId);
    return {
      isLinked: Boolean(business.telegramOrderChatId?.trim()),
      telegramOrderChatId: business.telegramOrderChatId?.trim() ?? null,
      pendingCode: pending?.code ?? null,
      pendingExpiresAt: pending?.expiresAt.toISOString() ?? null,
    };
  }

  async loadActiveCodesMap(
    businessIds: string[],
  ): Promise<Map<string, { code: string; expiresAt: Date }>> {
    if (!businessIds.length) return new Map();
    const now = new Date();
    const rows = await this.prisma.businessTelegramLinkCode.findMany({
      where: {
        businessId: { in: businessIds },
        usedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });
    const map = new Map<string, { code: string; expiresAt: Date }>();
    for (const row of rows) {
      if (!map.has(row.businessId)) {
        map.set(row.businessId, { code: row.code, expiresAt: row.expiresAt });
      }
    }
    return map;
  }

  async buildRestaurantPickerMarkup(page = 0): Promise<object> {
    const where: Prisma.BusinessWhereInput = {
      deletedAt: null,
      isActive: true,
      approvalStatus: BusinessApprovalStatus.APPROVED,
    };
    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: page * PICKER_PAGE_SIZE,
        take: PICKER_PAGE_SIZE,
        select: { id: true, name: true, kind: true },
      }),
      this.prisma.business.count({ where }),
    ]);

    const inline_keyboard: { text: string; callback_data: string }[][] = businesses.map((b) => [
      {
        text: `${b.kind === 'STORE' ? '🏪' : '🍽'} ${this.truncateLabel(b.name)}`,
        callback_data: `${TG_LINK_PICK_PREFIX}${b.id}`,
      },
    ]);

    const nav: { text: string; callback_data: string }[] = [];
    if (page > 0) {
      nav.push({ text: '◀️ Oldingi', callback_data: `${TG_LINK_PAGE_PREFIX}${page - 1}` });
    }
    if ((page + 1) * PICKER_PAGE_SIZE < total) {
      nav.push({ text: 'Keyingi ▶️', callback_data: `${TG_LINK_PAGE_PREFIX}${page + 1}` });
    }
    if (nav.length) inline_keyboard.push(nav);

    return { inline_keyboard };
  }

  getRestaurantPickerIntroText(): string {
    return 'Qaysi restoran/do\'kon uchun push sozlamoqchisiz? Ro\'yxatdan tanlang:';
  }

  async onRestaurantPicked(
    telegramId: bigint,
    businessId: string,
  ): Promise<{ businessName: string; text: string } | null> {
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        deletedAt: null,
        isActive: true,
        approvalStatus: BusinessApprovalStatus.APPROVED,
      },
      select: { id: true, name: true },
    });
    if (!business) return null;

    await this.generateLinkCode(business.id);
    await this.prisma.telegramBotConversation.upsert({
      where: { telegramId },
      create: { telegramId, step: 'enter_code', businessId: business.id },
      update: { step: 'enter_code', businessId: business.id },
    });

    return {
      businessName: business.name,
      text:
        `✅ <b>${this.escapeHtml(business.name)}</b> tanlandi.\n\n` +
        `6 xonali kod restoran paneli va biznes ilovasidagi <b>Telegram buyurtmalar</b> bo'limida ko'rinadi.\n\n` +
        `Kodni shu yerga yuboring (faqat raqamlar).`,
    };
  }

  async verifyCode(
    telegramId: bigint,
    chatId: string,
    rawCode: string,
  ): Promise<{ result: LinkCodeVerifyResult; businessName?: string }> {
    const conv = await this.prisma.telegramBotConversation.findUnique({
      where: { telegramId },
    });
    if (!conv || conv.step !== 'enter_code' || !conv.businessId) {
      return { result: 'no_session' };
    }

    const code = rawCode.replace(/\D/g, '');
    if (code.length !== 6) {
      return { result: 'invalid' };
    }

    const now = new Date();
    const pending = await this.prisma.businessTelegramLinkCode.findFirst({
      where: {
        businessId: conv.businessId,
        code,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pending) {
      return { result: 'invalid' };
    }
    if (pending.expiresAt <= now) {
      return { result: 'expired' };
    }

    const business = await this.prisma.business.findUnique({
      where: { id: conv.businessId },
      select: { name: true },
    });

    await this.prisma.$transaction([
      this.prisma.business.update({
        where: { id: conv.businessId },
        data: { telegramOrderChatId: chatId.trim() },
      }),
      this.prisma.businessTelegramLinkCode.update({
        where: { id: pending.id },
        data: { usedAt: now, linkedChatId: chatId.trim() },
      }),
      this.prisma.telegramBotConversation.delete({ where: { telegramId } }),
    ]);

    this.logger.log(`Telegram push linked for business ${conv.businessId} chat ${chatId}`);
    return { result: 'ok', businessName: business?.name };
  }

  async clearConversation(telegramId: bigint): Promise<void> {
    await this.prisma.telegramBotConversation.deleteMany({ where: { telegramId } });
  }

  async isAwaitingCode(telegramId: bigint): Promise<boolean> {
    const conv = await this.prisma.telegramBotConversation.findUnique({
      where: { telegramId },
    });
    return conv?.step === 'enter_code';
  }

  private async generateLinkCode(businessId: string): Promise<string> {
    await this.prisma.businessTelegramLinkCode.deleteMany({
      where: { businessId, usedAt: null },
    });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    await this.prisma.businessTelegramLinkCode.create({
      data: { businessId, code, expiresAt },
    });
    return code;
  }

  private async findActiveCode(businessId: string) {
    return this.prisma.businessTelegramLinkCode.findFirst({
      where: {
        businessId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private truncateLabel(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length <= 32) return trimmed;
    return `${trimmed.slice(0, 29)}...`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
