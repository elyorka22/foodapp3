import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TelegramSignedPayload,
  VerifiedTelegramUser,
} from './types/telegram-auth.types';
import { verifyTelegramLoginHash } from '../../common/utils/telegram-hash.util';

/**
 * Validates Telegram HMAC signatures only — no HTTP or widget coupling.
 * Used by TelegramAuthService and reusable from tests or future internal callers.
 */
@Injectable()
export class TelegramSignatureService {
  constructor(private config: ConfigService) {}

  verify(payload: TelegramSignedPayload): VerifiedTelegramUser {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken?.trim()) {
      throw new UnauthorizedException('Telegram authentication is not configured');
    }

    if (!verifyTelegramLoginHash(payload, botToken)) {
      throw new UnauthorizedException('Invalid Telegram login signature');
    }

    return {
      telegramId: BigInt(payload.id),
      firstName: payload.first_name.trim(),
      lastName: payload.last_name?.trim() || undefined,
      username: payload.username?.trim() || undefined,
      photoUrl: payload.photo_url?.trim() || undefined,
      authDate: payload.auth_date,
    };
  }
}
