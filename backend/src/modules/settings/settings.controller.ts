import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService, DeliveryPricing } from './settings.service';
import { AdminSettingsDto } from './dto/admin-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN)
  getAdmin() {
    return this.settings.getAdminSettings();
  }

  @Put('admin')
  @Roles(UserRole.SUPER_ADMIN)
  setAdmin(@Body() body: AdminSettingsDto, @CurrentUser() user: JwtPayload) {
    return this.settings.setAdminSettings(body, user.sub);
  }

  @Get('delivery-pricing')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  getDeliveryPricing() {
    return this.settings.getDeliveryPricing();
  }

  @Put('delivery-pricing')
  @Roles(UserRole.SUPER_ADMIN)
  setDeliveryPricing(@Body() body: Partial<DeliveryPricing>) {
    return this.settings.setDeliveryPricing(body);
  }

  @Get('courier-dispatch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  getCourierDispatch() {
    return this.settings.getCourierDispatchMode().then((mode) => ({ mode }));
  }
}
