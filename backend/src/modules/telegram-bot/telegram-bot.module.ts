import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotSettingsService } from './telegram-bot-settings.service';
import { TelegramBotWebhookService } from './telegram-bot-webhook.service';
import { TelegramBotLinkService } from './telegram-bot-link.service';
import { TelegramBotController } from './telegram-bot.controller';

@Module({
  controllers: [TelegramBotController],
  providers: [
    TelegramBotService,
    TelegramBotSettingsService,
    TelegramBotWebhookService,
    TelegramBotLinkService,
  ],
  exports: [TelegramBotService, TelegramBotLinkService],
})
export class TelegramBotModule {}
