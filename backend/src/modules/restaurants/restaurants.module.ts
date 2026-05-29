import { Module } from '@nestjs/common';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantScheduleService } from './restaurant-schedule.service';

@Module({
  imports: [AdminNotificationsModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, RestaurantScheduleService],
  exports: [RestaurantsService, RestaurantScheduleService],
})
export class RestaurantsModule {}
