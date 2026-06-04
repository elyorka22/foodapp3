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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { resolveBusinessId } from '../../domain/business/business-id.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
import { DishCategoriesService } from '../dish-categories/dish-categories.service';

/**
 * GET /categories — global dish categories (restaurants).
 * GET /categories?restaurantId= — per-store product categories.
 */
@ApiTags('product-categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private productCategories: CategoriesService,
    private dishCategories: DishCategoriesService,
  ) {}

  @Get()
  findAll(
    @Query('businessId') businessId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const bid = resolveBusinessId({ businessId, restaurantId });
    if (bid) {
      return this.productCategories.findByBusiness(bid, includeInactive === 'true');
    }
    if (includeInactive === 'true') {
      return this.dishCategories.findAllAdmin();
    }
    return this.dishCategories.findAllPublic();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  create(@Body() body: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    const bid = resolveBusinessId({
      businessId: body.businessId,
      restaurantId: body.restaurantId,
    });
    if (bid) {
      return this.productCategories.create(
        {
          businessId: bid,
          name: body.name,
          slug: body.slug,
          description: body.description,
          icon: body.icon,
          imageUrl: body.imageUrl,
          sortOrder: body.sortOrder,
        },
        user,
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productCategories.update(id, dto, user).catch(() =>
      this.dishCategories.update(id, dto),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productCategories.softDelete(id, user).catch(() =>
      this.dishCategories.softDelete(id),
    );
  }
}
