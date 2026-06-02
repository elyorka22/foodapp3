import { Module } from '@nestjs/common';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramSignatureService } from './telegram-signature.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [TelegramAuthController],
  providers: [TelegramAuthService, TelegramSignatureService],
  exports: [TelegramAuthService, TelegramSignatureService],
})
export class TelegramAuthModule {}
