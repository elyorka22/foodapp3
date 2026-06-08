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
 * GET /categories — global dish categories (no businessId).
 * GET /categories?businessId= — dish categories for restaurants, store categories for shops.
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
      return this.productCategories.findForBusinessMenu(bid, includeInactive === 'true');
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
    if (!bid) {
      throw new BadRequestException(
        'Global dish categories are managed at POST /dish-categories (admin only)',
      );
    }
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productCategories.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productCategories.softDelete(id, user);
  }
}
