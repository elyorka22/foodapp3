import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BruteForceService } from './brute-force.service';
import { WsAuthService } from './ws-auth.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  providers: [BruteForceService, WsAuthService],
  exports: [BruteForceService, WsAuthService, JwtModule],
})
export class SecurityModule {}
