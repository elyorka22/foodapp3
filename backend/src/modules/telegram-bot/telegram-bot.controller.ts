import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotSettingsService } from './telegram-bot-settings.service';
import { TelegramBotWebhookService } from './telegram-bot-webhook.service';
import { buildTelegramWebhookUrl, resolveWebhookSecret } from './telegram-bot-webhook.util';
import { TelegramWebhookUpdate } from './telegram-webhook.types';
import { TelegramBotSettingsDto } from './dto/telegram-bot-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('telegram-bot')
@Controller('telegram-bot')
export class TelegramBotController {
  private readonly logger = new Logger(TelegramBotController.name);

  constructor(
    private bot: TelegramBotService,
    private settings: TelegramBotSettingsService,
    private webhookService: TelegramBotWebhookService,
  ) {}

  @Post('webhook/:secret')
  @HttpCode(200)
  @ApiOperation({ summary: 'Telegram Bot API webhook (no auth)' })
  async receiveWebhook(@Param('secret') secret: string, @Req() req: Request) {
    const expected = resolveWebhookSecret();
    if (!expected || secret !== expected) {
      throw new ForbiddenException();
    }

    const update = req.body as TelegramWebhookUpdate;

    try {
      const callback = update.callback_query;
      if (callback?.id && callback.data && callback.message?.chat?.id) {
        this.logger.log(`Telegram callback: ${callback.data}`);
        const fromId = callback.from?.id;
        await this.bot.handleCallback(
          callback.id,
          callback.data,
          String(callback.message.chat.id),
          fromId ? BigInt(fromId) : undefined,
        );
        return { ok: true };
      }

      const message = update.message;
      if (!message?.chat?.id) {
        return { ok: true };
      }

      const chatId = String(message.chat.id);
      const from = message.from;
      const text = message.text?.trim() ?? '';

      if (!text) {
        return { ok: true };
      }

      const command = text.split(/\s+/)[0]?.toLowerCase();
      this.logger.log(`Telegram message: ${command || text.slice(0, 32)}`);

      const telegramId = from?.id ? BigInt(from.id) : undefined;

      if (command === '/start' && from?.id) {
        await this.bot.handleStart({
          chatId,
          telegramId: BigInt(from.id),
          username: from.username ?? null,
          firstName: from.first_name ?? null,
          lastName: from.last_name ?? null,
        });
        return { ok: true };
      }

      if (command === '/menu') {
        await this.bot.sendReplyKeyboardMenu(chatId);
        return { ok: true };
      }

      if (command === '/hide') {
        await this.bot.hideReplyKeyboard(chatId);
        return { ok: true };
      }

      const handled = await this.bot.handleButtonText(chatId, text, telegramId);
      if (!handled && command === '/help') {
        await this.bot.handleHelp(chatId);
      }
    } catch (err) {
      this.logger.error(
        `Telegram webhook handler error: ${err instanceof Error ? err.message : err}`,
      );
    }

    return { ok: true };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  async getAdminPanel(@CurrentUser() _user: JwtPayload) {
    const [settings, stats, webhookStatus, botDiagnostics] = await Promise.all([
      this.settings.getSettings(),
      this.settings.getStats(),
      this.webhookService.getStatus(),
      this.webhookService.getDiagnostics(),
    ]);
    const webhookUrl = buildTelegramWebhookUrl();

    return {
      botConfigured: this.bot.isConfigured(),
      botUsername: this.bot.botUsername ?? null,
      webhookUrl,
      webhookStatus,
      botDiagnostics,
      settings,
      stats,
    };
  }

  @Post('admin/register-webhook')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  async registerWebhook(@CurrentUser() _user: JwtPayload) {
    const result = await this.webhookService.registerWebhook();
    const webhookStatus = await this.webhookService.getStatus();
    return { ...result, webhookStatus };
  }

  @Put('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  async updateAdminSettings(
    @Body() dto: TelegramBotSettingsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const settings = await this.settings.setSettings(
      {
        welcomeMessage: dto.welcomeMessage,
        siteUrl: dto.siteUrl,
      },
      user.sub,
    );
    const stats = await this.settings.getStats();
    return { settings, stats };
  }
}
