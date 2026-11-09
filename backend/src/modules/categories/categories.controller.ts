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
 * GET /categories — global dish categories (no filters).
 * GET /categories?businessTypeId= | ?type= — shared store categories for a type.
 * GET /categories?businessId= — dish cats for restaurants, type-scoped store cats for shops.
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
    @Query('businessTypeId') businessTypeId?: string,
    @Query('type') type?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const inactive = includeInactive === 'true';
    const typeId = businessTypeId?.trim();
    const typeSlug = type?.trim();
    if (typeId || typeSlug) {
      return this.productCategories.findByBusinessType(
        { businessTypeId: typeId, typeSlug },
        inactive,
      );
    }

    const bid = resolveBusinessId({ businessId, restaurantId });
    if (bid) {
      return this.productCategories.findForBusinessMenu(bid, inactive);
    }
    if (inactive) {
      return this.dishCategories.findAllAdmin();
    }
    return this.dishCategories.findAllPublic();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  create(@Body() body: CreateCategoryDto, @CurrentUser() user: JwtPayload) {
    if (
      !body.businessTypeId?.trim() &&
      !body.type?.trim() &&
      !resolveBusinessId({
        businessId: body.businessId,
        restaurantId: body.restaurantId,
      })
    ) {
      throw new BadRequestException(
        'businessTypeId or type is required (or legacy businessId). Global dish categories: POST /dish-categories',
      );
    }
    return this.productCategories.create(
      {
        businessTypeId: body.businessTypeId,
        type: body.type,
        businessId: body.businessId,
        restaurantId: body.restaurantId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        imageUrl: body.imageUrl,
        imageScale: body.imageScale,
        imagePositionX: body.imagePositionX,
        imagePositionY: body.imagePositionY,
        sortOrder: body.sortOrder,
      },
      user,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productCategories.softDelete(id, user);
  }
}
