import { Module } from '@nestjs/common';
import { DishCategoriesController } from './dish-categories.controller';
import { DishCategoriesService } from './dish-categories.service';

@Module({
  controllers: [DishCategoriesController],
  providers: [DishCategoriesService],
  exports: [DishCategoriesService],
})
export class DishCategoriesModule {}
