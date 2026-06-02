import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { THROTTLE } from '../../common/constants/throttle.constants';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class TelegramAuthController {
  constructor(private telegramAuth: TelegramAuthService) {}

  @Post('telegram')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({
    summary: 'Customer sign-in with Telegram (signed payload)',
    description:
      'Accepts the standard Telegram signed user object (id, first_name, auth_date, hash, …). ' +
      'Used by the Web Login Widget, Flutter (`telegram_login` / Telegram SDK), and any mobile client. ' +
      'Server verifies HMAC with TELEGRAM_BOT_TOKEN, then returns JWT.',
  })
  signIn(@Body() dto: TelegramAuthDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.telegramAuth.signInWithTelegramPayload(dto, ip);
  }
}
