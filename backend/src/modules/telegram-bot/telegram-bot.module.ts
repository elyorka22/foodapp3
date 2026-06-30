import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotSettingsService } from './telegram-bot-settings.service';
import { TelegramBotController } from './telegram-bot.controller';

@Module({
  controllers: [TelegramBotController],
  providers: [TelegramBotService, TelegramBotSettingsService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
