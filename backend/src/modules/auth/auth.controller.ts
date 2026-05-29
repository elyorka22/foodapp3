import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { THROTTLE } from '../../common/constants/throttle.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: THROTTLE.AUTH_LOGIN })
  @ApiOperation({ summary: 'Staff login (JWT) — queries users table' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.authService.login(dto, ip);
  }

  @Post('staff/login')
  @Throttle({ default: THROTTLE.AUTH_LOGIN })
  @ApiOperation({ summary: 'Alias for staff login (same as POST /auth/login)' })
  staffLogin(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ips?.[0] ?? req.ip ?? 'unknown';
    return this.authService.login(dto, ip);
  }
}
