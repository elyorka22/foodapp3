import {
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BusinessesService } from './businesses.service';
import { BusinessesQueryDto } from './dto/businesses-query.dto';
import { isUuid } from '../../common/utils/uuid';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateRestaurantDto } from '../restaurants/dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../restaurants/dto/update-restaurant.dto';
import { AdminRestaurantsQueryDto } from '../restaurants/dto/admin-restaurants-query.dto';
import { RestaurantApprovalDto } from '../restaurants/dto/restaurant-approval.dto';
import { CreateBranchDto } from '../restaurants/dto/create-branch.dto';
import { UpdateBranchDto } from '../restaurants/dto/update-branch.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { BusinessBranchesService } from '../restaurants/business-branches.service';

/**
 * Canonical merchant API (web, mobile, admin).
 * Prefer these routes; `/restaurants/*` remains as a compatibility alias.
 */
@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(
    private businesses: BusinessesService,
    private restaurants: RestaurantsService,
    private branches: BusinessBranchesService,
  ) {}

  @Get()
  findAll(@Query() query: BusinessesQueryDto) {
    return this.businesses.findAllPublic(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Admin / staff business list' })
  findAllAdmin(
    @Query() query: AdminRestaurantsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.restaurants.findAllAdmin(query, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: JwtPayload) {
    return this.restaurants.create(dto, user);
  }

  @Get(':id/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  listBranches(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.branches.list(id, user);
  }

  @Post(':id/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  createBranch(
    @Param('id') id: string,
    @Body() dto: CreateBranchDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.branches.create(id, dto, user);
  }

  @Patch(':id/branches/:branchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  updateBranch(
    @Param('id') id: string,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateBranchDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.branches.update(id, branchId, dto, user);
  }

  @Post(':id/branches/:branchId/primary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  setPrimaryBranch(
    @Param('id') id: string,
    @Param('branchId') branchId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.branches.setPrimary(id, branchId, user);
  }

  @Delete(':id/branches/:branchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  deleteBranch(
    @Param('id') id: string,
    @Param('branchId') branchId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.branches.softDelete(id, branchId, user);
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

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    if (isUuid(idOrSlug)) {
      return this.businesses.findById(idOrSlug);
    }
    return this.businesses.findBySlug(idOrSlug);
  }
}
