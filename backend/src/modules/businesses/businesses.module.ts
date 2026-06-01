import { Module } from '@nestjs/common';
import { BusinessRepository } from '../../domain/business/business.repository';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [RestaurantsModule],
  controllers: [BusinessesController],
  providers: [BusinessRepository, BusinessesService],
  exports: [BusinessesService, BusinessRepository],
})
export class BusinessesModule {}
