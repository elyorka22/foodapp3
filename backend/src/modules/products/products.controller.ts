import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import { BulkProductsDto } from './dto/bulk-products.dto';
import { ProductImageDto } from './dto/product-image.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  findAllAdmin(@Query() query: AdminProductsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.products.findAllAdmin(query, user);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  bulk(@Body() dto: BulkProductsDto, @CurrentUser() user: JwtPayload) {
    return this.products.bulk(dto, user);
  }

  @Get()
  find(
    @Query('restaurantId') restaurantId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('dishCategoryId') dishCategoryId?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (dishCategoryId || categorySlug) {
      return this.products.findByDishCategory({
        dishCategoryId,
        categorySlug,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    }
    if (!restaurantId) {
      throw new BadRequestException('restaurantId is required unless dishCategoryId or categorySlug is set');
    }
    return this.products.findByRestaurant(restaurantId, categoryId, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.products.create(dto, user);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  addImage(@Param('id') id: string, @Body() dto: ProductImageDto, @CurrentUser() user: JwtPayload) {
    return this.products.addImage(id, dto.url, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @CurrentUser() user: JwtPayload) {
    return this.products.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.products.softDelete(id, user);
  }
}
