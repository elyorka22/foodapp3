import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CouriersService } from './couriers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('couriers')
@Controller('couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CouriersController {
  constructor(private couriers: CouriersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  findAll() {
    return this.couriers.findAll();
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

  @Patch('me/location')
  @Roles(UserRole.COURIER)
  updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.couriers.updateLocation(user.sub, body.latitude, body.longitude);
  }
}
