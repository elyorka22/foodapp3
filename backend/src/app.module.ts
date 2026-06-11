import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { SecurityModule } from './common/security/security.module';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DishCategoriesModule } from './modules/dish-categories/dish-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CouriersModule } from './modules/couriers/couriers.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StorageModule } from './modules/storage/storage.module';
import { UploadModule } from './modules/upload/upload.module';
import { HealthModule } from './modules/health/health.module';
import { BannersModule } from './modules/banners/banners.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminNotificationsModule } from './modules/admin-notifications/admin-notifications.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { GrowthModule } from './modules/growth/growth.module';
import { BusinessTypesModule } from './modules/business-types/business-types.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { TelegramAuthModule } from './modules/telegram-auth/telegram-auth.module';
import { GoogleAuthModule } from './modules/google-auth/google-auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { AccountDeletionModule } from './modules/account-deletion/account-deletion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SecurityModule,
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),
    PrismaModule,
    RedisModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    CategoriesModule,
    DishCategoriesModule,
    ProductsModule,
    OrdersModule,
    CouriersModule,
    SettingsModule,
    UploadModule,
    HealthModule,
    BannersModule,
    AnalyticsModule,
    CustomersModule,
    AuditModule,
    AdminNotificationsModule,
    PromoCodesModule,
    GrowthModule,
    BusinessTypesModule,
    BusinessesModule,
    MarketplaceModule,
    FirebaseModule,
    TelegramAuthModule,
    GoogleAuthModule,
    NotificationsModule,
    AccountDeletionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard }],
})
export class AppModule {}
