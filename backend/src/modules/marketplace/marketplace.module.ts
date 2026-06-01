import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { BusinessTypesModule } from '../business-types/business-types.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [BusinessTypesModule, CategoriesModule],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
