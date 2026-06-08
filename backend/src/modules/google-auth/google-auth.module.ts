import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GoogleTokenService } from './google-token.service';

@Module({
  imports: [CustomersModule],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, GoogleTokenService],
  exports: [GoogleAuthService],
})
export class GoogleAuthModule {}
