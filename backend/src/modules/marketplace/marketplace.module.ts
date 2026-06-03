import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { BusinessTypesModule } from '../business-types/business-types.module';
import { DishCategoriesModule } from '../dish-categories/dish-categories.module';

@Module({
  imports: [BusinessTypesModule, DishCategoriesModule],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
