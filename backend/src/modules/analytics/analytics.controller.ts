import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('global')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  global() {
    return this.analytics.getGlobalStats();
  }

  @Get('restaurant/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.RESTAURANT_OWNER)
  restaurant(@Param('id') id: string) {
    return this.analytics.getRestaurantStats(id);
  }
}
