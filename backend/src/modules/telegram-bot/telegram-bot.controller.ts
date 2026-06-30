import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotSettingsService } from './telegram-bot-settings.service';
import { TelegramWebhookUpdateDto } from './dto/telegram-webhook.dto';
import { TelegramBotSettingsDto } from './dto/telegram-bot-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('telegram-bot')
@Controller('telegram-bot')
export class TelegramBotController {
  constructor(
    private bot: TelegramBotService,
    private settings: TelegramBotSettingsService,
  ) {}

  @Post('webhook/:secret')
  @ApiOperation({ summary: 'Telegram Bot API webhook (no auth)' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async webhook(@Param('secret') secret: string, @Body() update: TelegramWebhookUpdateDto) {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    if (!expected || secret !== expected) {
      throw new ForbiddenException();
    }

    const callback = update.callback_query;
    if (callback?.id && callback.data && callback.message?.chat?.id) {
      await this.bot.handleCallback(
        callback.id,
        callback.data,
        String(callback.message.chat.id),
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

    const handled = await this.bot.handleButtonText(chatId, text);
    if (!handled && command === '/help') {
      await this.bot.handleHelp(chatId);
    }

    return { ok: true };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  async getAdminPanel(@CurrentUser() _user: JwtPayload) {
    const [settings, stats] = await Promise.all([
      this.settings.getSettings(),
      this.settings.getStats(),
    ]);
    const apiPublicUrl = process.env.API_PUBLIC_URL?.trim() || '';
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || '';
    const webhookUrl =
      apiPublicUrl && webhookSecret
        ? `${apiPublicUrl.replace(/\/$/, '')}/api/v1/telegram-bot/webhook/${webhookSecret}`
        : null;

    return {
      botConfigured: this.bot.isConfigured(),
      botUsername: this.bot.botUsername ?? null,
      webhookUrl,
      settings,
      stats,
    };
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
