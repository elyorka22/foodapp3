import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationAccountType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { NotificationService } from './notifications.service';
import {
  deviceRoleForStaffUser,
  PushDeliveryService,
} from './push/push-delivery.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationsQueryDto } from './dto/notifications-query.dto';

@ApiTags('notifications-staff')
@Controller('notifications/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffNotificationsController {
  constructor(
    private notifications: NotificationService,
    private pushDelivery: PushDeliveryService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  @ApiOperation({ summary: 'Staff notification history' })
  list(@CurrentUser() user: JwtPayload, @Query() query: NotificationsQueryDto) {
    return this.notifications.getUserNotifications(
      user.sub,
      NotificationAccountType.STAFF,
      query.limit,
      query.cursor,
    );
  }

  @Get('unread-count')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  unreadCount(@CurrentUser() user: JwtPayload) {
    return this.notifications.getUnreadCount(user.sub, NotificationAccountType.STAFF);
  }

  @Patch(':id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notifications.markAsRead(id, user.sub, NotificationAccountType.STAFF);
  }

  @Post('read-all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notifications.markAllAsRead(user.sub, NotificationAccountType.STAFF);
  }

  @Post('devices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  registerDevice(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.registerStaffDevice(user, dto);
  }

  @Post('devices/register')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  registerDeviceAlias(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.registerStaffDevice(user, dto);
  }

  private registerStaffDevice(user: JwtPayload, dto: RegisterDeviceDto) {
    return this.pushDelivery.registerDevice({
      userId: user.sub,
      accountType: NotificationAccountType.STAFF,
      role: deviceRoleForStaffUser(user.role),
      deviceId: dto.deviceId,
      platform: dto.platform,
      pushToken: dto.pushToken,
      appVersion: dto.appVersion,
    });
  }

  @Post('devices/unregister')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS, UserRole.COURIER)
  unregisterDevice(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.pushDelivery.clearDevicePushToken({
      userId: user.sub,
      accountType: NotificationAccountType.STAFF,
      deviceId: dto.deviceId,
    });
  }
}
