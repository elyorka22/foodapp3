import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Staff login (JWT) — queries users table' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('staff/login')
  @ApiOperation({ summary: 'Alias for staff login (same as POST /auth/login)' })
  staffLogin(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
