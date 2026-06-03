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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DishCategoriesService } from '../dish-categories/dish-categories.service';

/**
 * Product menu categories.
 * Public list returns global dish categories (admin-managed).
 * Legacy per-merchant CRUD is deprecated.
 */
@ApiTags('product-categories')
@Controller('categories')
export class CategoriesController {
  constructor(private dishCategories: DishCategoriesService) {}

  @Get()
  findAll(
    @Query('businessId') businessId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    if (includeInactive === 'true') {
      return this.dishCategories.findAllAdmin();
    }
    void businessId;
    void restaurantId;
    return this.dishCategories.findAllPublic();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  create(@Body() body: CreateCategoryDto) {
    if (body.businessId || body.restaurantId) {
      throw new BadRequestException(
        'Per-merchant categories are deprecated. Use POST /dish-categories for global dish categories.',
      );
    }
    return this.dishCategories.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      icon: body.icon,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.dishCategories.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.dishCategories.softDelete(id);
  }
}
