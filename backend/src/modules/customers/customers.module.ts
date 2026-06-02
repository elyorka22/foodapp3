import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomerTokenService } from './customer-token.service';
import { CustomerJwtStrategy } from './customer-jwt.strategy';

@Module({
  imports: [
    AdminNotificationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerTokenService, CustomerJwtStrategy],
  exports: [CustomersService, CustomerTokenService],
})
export class CustomersModule {}
