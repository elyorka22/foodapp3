import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessTypesService } from '../business-types/business-types.service';
import { DishCategoriesService } from '../dish-categories/dish-categories.service';

/**
 * Marketplace discovery — business verticals vs global dish categories are separate.
 */
@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private businessTypes: BusinessTypesService,
    private dishCategories: DishCategoriesService,
  ) {}

  @Get('business-types')
  listBusinessTypes() {
    return this.businessTypes.findAllPublic();
  }

  /** Global dish categories (Pizza, Burgers, …). Legacy alias: product-categories */
  @Get('product-categories')
  listProductCategories(@Query('includeInactive') includeInactive?: string) {
    return this.listDishCategories(includeInactive);
  }

  @Get('dish-categories')
  listDishCategories(@Query('includeInactive') includeInactive?: string) {
    if (includeInactive === 'true') {
      return this.dishCategories.findAllAdmin();
    }
    return this.dishCategories.findAllPublic();
  }
}
