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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { resolveBusinessId } from '../../domain/business/business-id.util';

/** Product menu categories for a business (NOT business vertical types). */
@ApiTags('product-categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  findByBusiness(
    @Query('businessId') businessId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const id = resolveBusinessId({ businessId, restaurantId });
    if (!id) {
      throw new BadRequestException('businessId (or legacy restaurantId) is required');
    }
    return this.categories.findByBusiness(id, includeInactive === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  create(@Body() body: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    return this.categories.create(body, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: JwtPayload) {
    return this.categories.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categories.softDelete(id, user);
  }
}
