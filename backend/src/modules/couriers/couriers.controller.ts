import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, NotificationAccountType, DeviceRole } from '@prisma/client';
import { CouriersService } from './couriers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { CourierStatusDto } from './dto/courier-status.dto';
import { DeclineCourierOrderDto } from '../orders/dto/assign-courier.dto';
import { AdminCouriersQueryDto } from './dto/admin-couriers-query.dto';
import { RegisterDeviceDto } from '../notifications/dto/register-device.dto';
import { PushDeliveryService } from '../notifications/push/push-delivery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('couriers')
@Controller('couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CouriersController {
  constructor(
    private couriers: CouriersService,
    private pushDelivery: PushDeliveryService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findAll(@Query() query: AdminCouriersQueryDto, @Req() req: Request) {
    // PaginationDto defaults page=1 even with no query string; only paginate when client sent params.
    const q = req.query as Record<string, string | undefined>;
    const wantsPaginated =
      'page' in q ||
      'limit' in q ||
      'search' in q ||
      'isActive' in q ||
      'isOnline' in q;
    if (wantsPaginated) {
      return this.couriers.findAllAdmin(query);
    }
    return this.couriers.findAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateCourierDto, @CurrentUser() user: JwtPayload) {
    return this.couriers.create(dto, user.sub);
  }

  @Get('me')
  @Roles(UserRole.COURIER)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.couriers.getProfile(user.sub);
  }

  @Get('me/orders/available')
  @Roles(UserRole.COURIER)
  availableOrders() {
    return this.couriers.getAvailableOrders();
  }

  @Get('me/earnings')
  @Roles(UserRole.COURIER)
  earnings(@CurrentUser() user: JwtPayload) {
    return this.couriers.getEarnings(user.sub);
  }

  @Patch('me/online')
  @Roles(UserRole.COURIER)
  setOnline(@CurrentUser() user: JwtPayload, @Body() body: { isOnline: boolean }) {
    return this.couriers.setOnline(user.sub, body.isOnline);
  }

  @Post('devices/register')
  @Roles(UserRole.COURIER)
  registerDevice(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.pushDelivery.registerDevice({
      userId: user.sub,
      accountType: NotificationAccountType.STAFF,
      role: DeviceRole.COURIER,
      deviceId: dto.deviceId,
      platform: dto.platform,
      pushToken: dto.pushToken,
      appVersion: dto.appVersion,
    });
  }

  @Post('devices/unregister')
  @Roles(UserRole.COURIER)
  unregisterDevice(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.pushDelivery.clearDevicePushToken({
      accountType: NotificationAccountType.STAFF,
      deviceId: dto.deviceId,
    });
  }

  @Patch('me/location')
  @Roles(UserRole.COURIER)
  updateMeLocation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.couriers.updateLocation(user.sub, body.latitude, body.longitude);
  }

  @Patch('location')
  @Roles(UserRole.COURIER)
  updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.couriers.updateLocation(user.sub, body.latitude, body.longitude);
  }

  @Post('orders/:orderId/decline')
  @Roles(UserRole.COURIER)
  declineOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: DeclineCourierOrderDto,
  ) {
    return this.couriers.declineOrder(user.sub, orderId, body.reason);
  }

  @Get(':id/history')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  history(@Param('id') id: string) {
    return this.couriers.getHistory(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: CourierStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.couriers.updateStatus(id, dto, user.sub);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.couriers.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCourierDto) {
    return this.couriers.update(id, dto);
  }
}
