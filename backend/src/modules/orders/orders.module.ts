import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { SettingsModule } from '../settings/settings.module';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { GrowthModule } from '../growth/growth.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [SettingsModule, AdminNotificationsModule, PromoCodesModule, GrowthModule, RestaurantsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
