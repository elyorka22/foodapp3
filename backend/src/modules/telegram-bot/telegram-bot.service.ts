import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramBotSettingsService } from './telegram-bot-settings.service';
import {
  TG_BTN_CHAT_ID,
  TG_BTN_HELP,
  TG_BTN_OPEN_SITE,
  TG_BTN_PARTNERSHIP,
  TG_BTN_PUSH_SETUP,
  TG_BTN_HIDE_MENU,
  TG_CALLBACK_CHAT_ID,
  TG_CALLBACK_HELP,
  TG_CALLBACK_PUSH_SETUP,
  buildMainInlineKeyboard,
  buildMainReplyKeyboard,
  buildRemoveReplyKeyboard,
  buildPartnershipUrl,
} from './telegram-bot-keyboard';
import {
  TG_LINK_PAGE_PREFIX,
  TG_LINK_PICK_PREFIX,
  TelegramBotLinkService,
} from './telegram-bot-link.service';
import { resolveConfiguredBotUsername, resolveMessagingBotToken } from './telegram-bot-env';

type TelegramApiResponse = { ok: boolean; description?: string };

type SendMessageOptions = {
  replyMarkup?: object;
};

type SendMenuOptions = {
  /** Show bottom reply-keyboard menu (only needed once per chat session). */
  attachReplyKeyboard?: boolean;
};

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    private prisma: PrismaService,
    private botSettings: TelegramBotSettingsService,
    private linkService: TelegramBotLinkService,
  ) {}

  private get token(): string | undefined {
    return resolveMessagingBotToken();
  }

  get botUsername(): string | undefined {
    return resolveConfiguredBotUsername();
  }

  isConfigured(): boolean {
    return Boolean(this.token);
  }

  async sendMessage(
    chatId: string,
    text: string,
    options?: SendMessageOptions,
  ): Promise<boolean> {
    if (!this.token || !chatId.trim()) return false;
    try {
      const body: Record<string, unknown> = {
        chat_id: chatId.trim(),
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      };
      if (options?.replyMarkup) {
        body.reply_markup = options.replyMarkup;
      }
      const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as TelegramApiResponse;
      if (!data.ok) {
        this.logger.warn(`Telegram sendMessage failed for chat ${chatId}: ${data.description}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.warn(`Telegram sendMessage error: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    if (!this.token) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          ...(text ? { text, show_alert: text.length > 60 } : {}),
        }),
      });
    } catch {
      // non-critical
    }
  }

  async sendMainMenu(
    chatId: string,
    introText?: string,
    options?: SendMenuOptions,
  ): Promise<void> {
    const settings = await this.botSettings.getSettings();
    const text = introText ?? settings.welcomeMessage;
    await this.sendMessage(chatId, text, {
      replyMarkup: buildMainInlineKeyboard(settings.siteUrl),
    });
    if (options?.attachReplyKeyboard) {
      await this.sendReplyKeyboardMenu(chatId);
    }
  }

  async sendReplyKeyboardMenu(chatId: string): Promise<void> {
    await this.sendMessage(
      chatId,
      '👇 Menyu tugmalari pastda.\nYashirish: «⬇️ Menyuni yashirish» yoki /hide',
      {
        replyMarkup: buildMainReplyKeyboard(),
      },
    );
  }

  async hideReplyKeyboard(chatId: string): Promise<void> {
    await this.sendMessage(chatId, 'Menyu yashirildi. Qayta ochish: /menu', {
      replyMarkup: buildRemoveReplyKeyboard(),
    });
  }

  async handleStart(params: {
    chatId: string;
    telegramId: bigint;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }): Promise<void> {
    const now = new Date();
    try {
      await this.prisma.telegramBotSubscriber.upsert({
        where: { telegramId: params.telegramId },
        create: {
          telegramId: params.telegramId,
          chatId: params.chatId,
          telegramUsername: params.username ?? null,
          firstName: params.firstName ?? null,
          lastName: params.lastName ?? null,
          firstStartedAt: now,
          lastStartedAt: now,
          startCount: 1,
        },
        update: {
          chatId: params.chatId,
          telegramUsername: params.username ?? null,
          firstName: params.firstName ?? null,
          lastName: params.lastName ?? null,
          lastStartedAt: now,
          startCount: { increment: 1 },
        },
      });
    } catch (err) {
      this.logger.error(
        `Telegram subscriber save failed (run prisma migrate?): ${err instanceof Error ? err.message : err}`,
      );
    }

    await this.sendMainMenu(params.chatId, undefined, { attachReplyKeyboard: true });
  }

  async handleMyId(chatId: string): Promise<void> {
    const settings = await this.botSettings.getSettings();
    await this.sendMessage(
      chatId,
      `Sizning chat ID:\n<code>${chatId}</code>\n\nRestoran panelida «Telegram buyurtmalar» bo'limiga shu raqamni kiriting.`,
      { replyMarkup: buildMainInlineKeyboard(settings.siteUrl) },
    );
  }

  async handleHelp(chatId: string): Promise<void> {
    const settings = await this.botSettings.getSettings();
    await this.sendMessage(
      chatId,
      `<b>FoodApp bot</b>\n\n` +
        `• <b>${TG_BTN_OPEN_SITE}</b> — saytga o'tish va buyurtma berish\n` +
        `• <b>${TG_BTN_PARTNERSHIP}</b> — restoranlar uchun hamkorlik sahifasi\n` +
        `• <b>${TG_BTN_CHAT_ID}</b> — restoran uchun buyurtma bildirishnomalari (chat ID)\n` +
        `• <b>${TG_BTN_PUSH_SETUP}</b> — pushni kod orqali ulash\n\n` +
        `Pastdagi menyu yoki xabar ostidagi tugmalardan foydalaning.\n` +
        `Restoran egasi bo'lsangiz: «${TG_BTN_PARTNERSHIP}» yoki «${TG_BTN_CHAT_ID}» tugmalaridan foydalaning.`,
      { replyMarkup: buildMainInlineKeyboard(settings.siteUrl) },
    );
  }

  async handleButtonText(chatId: string, text: string, telegramId?: bigint): Promise<boolean> {
    const normalized = text.trim();
    if (normalized === TG_BTN_HIDE_MENU || normalized === '/hide') {
      await this.hideReplyKeyboard(chatId);
      return true;
    }
    if (normalized === TG_BTN_PUSH_SETUP) {
      await this.startPushSetup(chatId);
      return true;
    }
    if (telegramId && (await this.linkService.isAwaitingCode(telegramId))) {
      const digits = normalized.replace(/\D/g, '');
      if (digits.length === 6) {
        await this.handleLinkCodeEntry(telegramId, chatId, digits);
        return true;
      }
    }
    if (normalized === TG_BTN_CHAT_ID || normalized === '/myid' || normalized === '/chatid') {
      await this.handleMyId(chatId);
      return true;
    }
    if (normalized === TG_BTN_HELP || normalized === '/help') {
      await this.handleHelp(chatId);
      return true;
    }
    if (normalized === TG_BTN_OPEN_SITE) {
      await this.sendMainMenu(
        chatId,
        "Saytga o'tish uchun quyidagi tugmani bosing:",
      );
      return true;
    }
    if (normalized === TG_BTN_PARTNERSHIP) {
      const settings = await this.botSettings.getSettings();
      await this.sendMessage(
        chatId,
        'Restoranlar uchun hamkorlik sahifasi:',
        {
          replyMarkup: {
            inline_keyboard: [
              [{ text: TG_BTN_PARTNERSHIP, url: buildPartnershipUrl(settings.siteUrl) }],
            ],
          },
        },
      );
      return true;
    }
    return false;
  }

  async handleCallback(
    callbackQueryId: string,
    data: string,
    chatId: string,
    telegramId?: bigint,
  ): Promise<void> {
    if (data === TG_CALLBACK_PUSH_SETUP) {
      await this.answerCallbackQuery(callbackQueryId);
      await this.startPushSetup(chatId);
      return;
    }
    if (data.startsWith(TG_LINK_PICK_PREFIX)) {
      await this.answerCallbackQuery(callbackQueryId);
      const businessId = data.slice(TG_LINK_PICK_PREFIX.length);
      if (telegramId) {
        await this.handleRestaurantPick(telegramId, chatId, businessId);
      }
      return;
    }
    if (data.startsWith(TG_LINK_PAGE_PREFIX)) {
      await this.answerCallbackQuery(callbackQueryId);
      const page = parseInt(data.slice(TG_LINK_PAGE_PREFIX.length), 10);
      if (!Number.isNaN(page) && page >= 0) {
        await this.sendRestaurantPicker(chatId, page);
      }
      return;
    }
    if (data === TG_CALLBACK_CHAT_ID) {
      await this.answerCallbackQuery(callbackQueryId);
      await this.handleMyId(chatId);
      return;
    }
    if (data === TG_CALLBACK_HELP) {
      await this.answerCallbackQuery(callbackQueryId);
      await this.handleHelp(chatId);
      return;
    }
    await this.answerCallbackQuery(callbackQueryId);
  }

  async startPushSetup(chatId: string): Promise<void> {
    await this.sendRestaurantPicker(chatId, 0);
  }

  async sendRestaurantPicker(chatId: string, page: number): Promise<void> {
    const markup = await this.linkService.buildRestaurantPickerMarkup(page);
    await this.sendMessage(chatId, this.linkService.getRestaurantPickerIntroText(), {
      replyMarkup: markup,
    });
  }

  async handleRestaurantPick(
    telegramId: bigint,
    chatId: string,
    businessId: string,
  ): Promise<void> {
    const picked = await this.linkService.onRestaurantPicked(telegramId, businessId);
    if (!picked) {
      await this.sendMessage(chatId, 'Restoran topilmadi. Qayta tanlang.');
      await this.sendRestaurantPicker(chatId, 0);
      return;
    }
    await this.sendMessage(chatId, picked.text);
  }

  async handleLinkCodeEntry(
    telegramId: bigint,
    chatId: string,
    rawCode: string,
  ): Promise<boolean> {
    const { result, businessName } = await this.linkService.verifyCode(
      telegramId,
      chatId,
      rawCode,
    );
    const settings = await this.botSettings.getSettings();

    if (result === 'ok') {
      await this.sendMessage(
        chatId,
        `✅ <b>Push sozlandi!</b>\n\n` +
          `«${this.escapeHtml(businessName ?? 'Restoran')}» uchun yangi buyurtmalar shu chatga keladi.`,
        { replyMarkup: buildMainInlineKeyboard(settings.siteUrl) },
      );
      return true;
    }
    if (result === 'expired') {
      await this.sendMessage(
        chatId,
        '⏱ Kod muddati tugagan. «Push sozlash» tugmasini bosing va qayta urinib ko\'ring.',
      );
      await this.linkService.clearConversation(telegramId);
      return true;
    }
    if (result === 'invalid') {
      await this.sendMessage(chatId, '❌ Noto\'g\'ri kod. Paneldagi 6 xonali kodni kiriting.');
      return true;
    }
    return false;
  }

  async notifyRestaurantNewOrder(order: {
    id: string;
    orderNumber: string;
    businessId: string;
    total: Prisma.Decimal | number;
    subtotal: Prisma.Decimal | number;
    deliveryFee: Prisma.Decimal | number;
    items: {
      name: string;
      quantity: number;
      subtotal: Prisma.Decimal | number;
      description?: string | null;
      price?: Prisma.Decimal | number;
    }[];
    guestOrder?: { phone: string; deliveryAddress?: string | null; comment?: string | null } | null;
    business?: { name: string; telegramOrderChatId?: string | null } | null;
  }): Promise<void> {
    if (!this.isConfigured()) return;

    let chatId = order.business?.telegramOrderChatId?.trim();
    if (!chatId) {
      const business = await this.prisma.business.findUnique({
        where: { id: order.businessId },
        select: { telegramOrderChatId: true, name: true },
      });
      chatId = business?.telegramOrderChatId?.trim() ?? '';
      if (!chatId) return;
      order = { ...order, business: { name: business?.name ?? '', telegramOrderChatId: chatId } };
    }

    const dbItems = await this.prisma.orderItem.findMany({
      where: { orderId: order.id },
      select: {
        name: true,
        quantity: true,
        subtotal: true,
        description: true,
        price: true,
        product: { select: { description: true } },
      },
    });
    const items = dbItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      subtotal: item.subtotal,
      price: item.price,
      description: item.description?.trim() || item.product.description?.trim() || null,
    }));

    const orderDetails = await this.prisma.order.findUnique({
      where: { id: order.id },
      select: {
        customerLatitude: true,
        customerLongitude: true,
        guestOrder: {
          select: {
            phone: true,
            deliveryAddress: true,
            comment: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    const guest = orderDetails?.guestOrder;
    const latitude = this.toCoordinate(
      orderDetails?.customerLatitude ?? guest?.latitude,
    );
    const longitude = this.toCoordinate(
      orderDetails?.customerLongitude ?? guest?.longitude,
    );

    const phone = guest?.phone ?? order.guestOrder?.phone ?? '—';
    const address = this.formatDeliveryAddress(guest?.deliveryAddress, latitude, longitude);
    const comment = guest?.comment?.trim() ?? order.guestOrder?.comment?.trim();
    const total = this.formatMoney(order.total);
    const delivery = this.formatMoney(order.deliveryFee);

    const lines = items.map((item) => this.formatOrderItemLine(item));

    let text =
      `🆕 <b>Yangi buyurtma #${this.escapeHtml(order.orderNumber)}</b>\n\n` +
      `🏪 ${this.escapeHtml(order.business?.name ?? 'Restoran')}\n` +
      `👤 ${this.escapeHtml(phone)}\n` +
      `📍 ${this.escapeHtml(address)}\n` +
      `🚚 Yetkazish: ${delivery}\n` +
      `💰 <b>Jami: ${total}</b>\n\n` +
      `<b>Taomlar:</b>\n${lines.join('\n')}`;

    if (comment) {
      text += `\n\n💬 ${this.escapeHtml(comment)}`;
    }

    const replyMarkup =
      latitude != null && longitude != null
        ? {
            inline_keyboard: [
              [
                {
                  text: '🗺 Xaritada ochish',
                  url: this.buildMapUrl(latitude, longitude),
                },
              ],
            ],
          }
        : undefined;

    await this.sendMessage(chatId, text, { replyMarkup });
  }

  private formatOrderItemLine(item: {
    name: string;
    quantity: number;
    subtotal: Prisma.Decimal | number;
    description?: string | null;
    price?: Prisma.Decimal | number;
  }): string {
    const unitPrice =
      item.price != null
        ? this.formatMoney(item.price)
        : item.quantity > 0
          ? this.formatMoney(Number(item.subtotal) / item.quantity)
          : this.formatMoney(item.subtotal);
    let line =
      `• <b>${this.escapeHtml(item.name)}</b> ×${item.quantity} (${unitPrice}) — ${this.formatMoney(item.subtotal)}`;
    const description = item.description?.trim();
    if (description) {
      line += `\n   ${this.escapeHtml(this.truncateText(description, 280))}`;
    }
    return line;
  }

  private truncateText(value: string, maxLen: number): string {
    if (value.length <= maxLen) return value;
    return `${value.slice(0, maxLen - 1)}…`;
  }

  private toCoordinate(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value == null) return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private formatDeliveryAddress(
    deliveryAddress: string | null | undefined,
    latitude: number | null,
    longitude: number | null,
  ): string {
    const raw = deliveryAddress?.trim() ?? '';
    const isGpsOnly = /^GPS:\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/i.test(raw);
    if (raw && !isGpsOnly) return raw;
    if (latitude != null && longitude != null) {
      return 'Manzil — xaritadan oching';
    }
    return raw || '—';
  }

  private buildMapUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  private formatMoney(value: Prisma.Decimal | number): string {
    const n = typeof value === 'number' ? value : Number(value);
    return `${Math.round(n).toLocaleString('uz-UZ')} so'm`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
