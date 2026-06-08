import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { THROTTLE } from '../../common/constants/throttle.constants';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleAuthService } from './google-auth.service';

@ApiTags('auth')
@Controller('auth')
export class GoogleAuthController {
  constructor(private googleAuth: GoogleAuthService) {}

  @Post('google')
  @Throttle({ default: THROTTLE.CUSTOMER_AUTH })
  @ApiOperation({
    summary: 'Customer sign-in with Google (Firebase ID token)',
    description:
      'Verifies a Firebase Authentication ID token from Google Sign-In on web or mobile, ' +
      'then returns the same JWT payload as phone/Telegram login.',
  })
  @ApiResponse({ status: 201, description: 'JWT access token and customer profile' })
  @ApiResponse({ status: 400, description: 'Missing email or malformed token' })
  @ApiResponse({ status: 401, description: 'Invalid Firebase ID token' })
  signIn(@Body() dto: GoogleAuthDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.googleAuth.signInWithIdToken(dto.idToken, ip);
  }
}
