import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RestaurantsService } from './restaurants.service';
import { RestaurantScheduleService } from './restaurant-schedule.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantApprovalDto } from './dto/restaurant-approval.dto';
import { AdminRestaurantsQueryDto } from './dto/admin-restaurants-query.dto';
import { SetWorkingHoursDto } from './dto/set-working-hours.dto';
import { AddHolidayDto } from './dto/add-holiday.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { isUuid } from '../../common/utils/uuid';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private restaurants: RestaurantsService,
    private schedule: RestaurantScheduleService,
  ) {}

  @Get()
  findAllPublic(@Query() query: PaginationDto) {
    return this.restaurants.findAllPublic(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  findAllAdmin(@Query() query: AdminRestaurantsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.restaurants.findAllAdmin(query, user);
  }

  @Get(':id/finance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  getFinance(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.restaurants.getFinance(id, user);
  }

  @Get(':id/availability')
  async getAvailability(@Param('id') id: string) {
    const isOpen = await this.schedule.isOpen(id);
    return { isOpen };
  }

  @Get(':id/working-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  getWorkingHours(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    this.restaurants.assertAccess(id, user);
    return this.schedule.getWorkingHours(id);
  }

  @Post(':id/working-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  setWorkingHours(
    @Param('id') id: string,
    @Body() dto: SetWorkingHoursDto,
    @CurrentUser() user: JwtPayload,
  ) {
    this.restaurants.assertAccess(id, user);
    return this.schedule.setWorkingHours(id, dto.hours);
  }

  @Get(':id/holidays')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  getHolidays(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    this.restaurants.assertAccess(id, user);
    return this.schedule.getHolidays(id);
  }

  @Post(':id/holidays')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  addHoliday(
    @Param('id') id: string,
    @Body() dto: AddHolidayDto,
    @CurrentUser() user: JwtPayload,
  ) {
    this.restaurants.assertAccess(id, user);
    return this.schedule.addHoliday(id, dto.date, dto.reason);
  }

  @Delete(':id/holidays/:holidayId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  removeHoliday(
    @Param('id') id: string,
    @Param('holidayId') holidayId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    this.restaurants.assertAccess(id, user);
    return this.schedule.removeHoliday(id, holidayId);
  }

  @Get(':param/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  getStats(@Param('param') param: string, @CurrentUser() user: JwtPayload) {
    if (!isUuid(param)) throw new BadRequestException('Invalid restaurant id');
    return this.restaurants.getStats(param, user);
  }

  @Get(':param')
  findOne(@Param('param') param: string, @CurrentUser() user?: JwtPayload) {
    if (isUuid(param)) {
      return this.restaurants.findById(param, user);
    }
    return this.restaurants.findBySlug(param);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: JwtPayload) {
    return this.restaurants.create(dto, user);
  }

  @Patch(':id/approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  updateApproval(
    @Param('id') id: string,
    @Body() dto: RestaurantApprovalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.restaurants.updateApproval(id, dto.status, dto.note, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.restaurants.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.restaurants.softDelete(id, user);
  }
}
