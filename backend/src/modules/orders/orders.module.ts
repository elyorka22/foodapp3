import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { SettingsModule } from '../settings/settings.module';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { GrowthModule } from '../growth/growth.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DeliveryPricingService } from '../../domain/delivery/delivery-pricing.service';

@Module({
  imports: [
    SettingsModule,
    AdminNotificationsModule,
    PromoCodesModule,
    GrowthModule,
    RestaurantsModule,
    CustomersModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway, DeliveryPricingService],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
