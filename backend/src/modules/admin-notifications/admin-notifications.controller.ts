import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminNotificationsService } from './admin-notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('admin-notifications')
@Controller('admin-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminNotificationsController {
  constructor(private notifications: AdminNotificationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  list(@CurrentUser() user: JwtPayload) {
    return this.notifications.listForUser(user.sub);
  }

  @Get('unread-count')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  unreadCount(@CurrentUser() user: JwtPayload) {
    return this.notifications.unreadCount(user.sub);
  }

  @Patch(':id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notifications.markRead(id, user.sub);
  }

  @Post('read-all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notifications.markAllRead(user.sub);
  }
}
