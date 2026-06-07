import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { AdminPushService } from './admin-push.service';
import { AdminSendPushDto } from './dto/admin-send-push.dto';

@ApiTags('notifications-admin')
@Controller('notifications/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminPushController {
  constructor(private adminPush: AdminPushService) {}

  @Get('push/audiences')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Audiences the current admin role may target' })
  audiences(@CurrentUser() user: JwtPayload) {
    return {
      audiences: this.adminPush.getAllowedAudiences(user.role as UserRole),
    };
  }

  @Get('push/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Recipient counts and registered push devices' })
  stats() {
    return this.adminPush.getPushStats();
  }

  @Post('push/send')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Send in-app notification + push to audience' })
  send(@CurrentUser() user: JwtPayload, @Body() dto: AdminSendPushDto) {
    return this.adminPush.sendBroadcast(user.sub, user.role as UserRole, dto);
  }
}
