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
import { NotificationAccountType } from '@prisma/client';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { CustomerJwtPayload } from '../customers/customer-token.service';
import { NotificationService } from './notifications.service';
import { PushDeliveryService } from './push/push-delivery.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationsQueryDto } from './dto/notifications-query.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notifications: NotificationService,
    private pushDelivery: PushDeliveryService,
  ) {}

  @Get()
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer notification history (read-only list)' })
  list(
    @CurrentCustomer() customer: CustomerJwtPayload,
    @Query() query: NotificationsQueryDto,
  ) {
    return this.notifications.getUserNotifications(
      customer.sub,
      NotificationAccountType.CUSTOMER,
      query.limit,
      query.cursor,
    );
  }

  @Get('unread-count')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  unreadCount(@CurrentCustomer() customer: CustomerJwtPayload) {
    return this.notifications.getUnreadCount(
      customer.sub,
      NotificationAccountType.CUSTOMER,
    );
  }

  @Patch(':id/read')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  markRead(
    @Param('id') id: string,
    @CurrentCustomer() customer: CustomerJwtPayload,
  ) {
    return this.notifications.markAsRead(
      id,
      customer.sub,
      NotificationAccountType.CUSTOMER,
    );
  }

  @Post('read-all')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  markAllRead(@CurrentCustomer() customer: CustomerJwtPayload) {
    return this.notifications.markAllAsRead(
      customer.sub,
      NotificationAccountType.CUSTOMER,
    );
  }

  @Post('devices')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register device for FCM/APNs transport' })
  registerDevice(
    @CurrentCustomer() customer: CustomerJwtPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.pushDelivery.registerDevice({
      userId: customer.sub,
      accountType: NotificationAccountType.CUSTOMER,
      deviceId: dto.deviceId,
      platform: dto.platform,
      pushToken: dto.pushToken,
      appVersion: dto.appVersion,
    });
  }

  @Post('devices/unregister')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear push token on logout' })
  unregisterDevice(
    @CurrentCustomer() customer: CustomerJwtPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.pushDelivery.clearDevicePushToken({
      userId: customer.sub,
      accountType: NotificationAccountType.CUSTOMER,
      deviceId: dto.deviceId,
    });
  }
}
