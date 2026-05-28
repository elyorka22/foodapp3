import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService, DeliveryPricing } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get('delivery-pricing')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  getDeliveryPricing() {
    return this.settings.getDeliveryPricing();
  }

  @Put('delivery-pricing')
  @Roles(UserRole.SUPER_ADMIN)
  setDeliveryPricing(@Body() body: DeliveryPricing) {
    return this.settings.setDeliveryPricing(body);
  }
}
