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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CouriersService } from './couriers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { CourierStatusDto } from './dto/courier-status.dto';
import { AdminCouriersQueryDto } from './dto/admin-couriers-query.dto';
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
  findAll(@Query() query: AdminCouriersQueryDto) {
    if (query.page || query.search || query.isActive !== undefined || query.isOnline !== undefined) {
      return this.couriers.findAllAdmin(query);
    }
    return this.couriers.findAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
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

  @Patch('me/location')
  @Roles(UserRole.COURIER)
  updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.couriers.updateLocation(user.sub, body.latitude, body.longitude);
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
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCourierDto) {
    return this.couriers.update(id, dto);
  }
}
