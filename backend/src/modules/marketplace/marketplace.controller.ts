import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessTypesService } from '../business-types/business-types.service';
import { CategoriesService } from '../categories/categories.service';
import { resolveBusinessId } from '../../domain/business/business-id.util';
import { BadRequestException } from '@nestjs/common';

/**
 * Marketplace discovery — business verticals vs product menu categories are separate.
 */
@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private businessTypes: BusinessTypesService,
    private productCategories: CategoriesService,
  ) {}

  @Get('business-types')
  listBusinessTypes() {
    return this.businessTypes.findAllPublic();
  }

  @Get('product-categories')
  listProductCategories(
    @Query('businessId') businessId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const id = resolveBusinessId({ businessId, restaurantId });
    if (!id) {
      throw new BadRequestException('businessId (or legacy restaurantId) is required');
    }
    return this.productCategories.findByBusiness(id, includeInactive === 'true');
  }
}
