import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityModule } from '../../common/security/security.module';
import { NotificationService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { StaffNotificationsController } from './staff-notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { PushDeliveryService } from './push/push-delivery.service';
import { FirebasePushProvider } from './push/firebase-push.provider';
import { NoopPushProvider } from './push/noop-push.provider';
import { PUSH_PROVIDER } from './push/push-provider.interface';
import { PushNotificationHooks } from './push/push-notification.hooks';

function pushProviderFactory(
  config: ConfigService,
  noop: NoopPushProvider,
  firebase: FirebasePushProvider,
) {
  const provider = (config.get<string>('PUSH_PROVIDER') ?? 'noop').toLowerCase();
  if (provider === 'firebase') return firebase;
  return noop;
}

@Module({
  imports: [SecurityModule],
  controllers: [NotificationsController, StaffNotificationsController],
  providers: [
    NotificationService,
    NotificationsGateway,
    PushDeliveryService,
    PushNotificationHooks,
    NoopPushProvider,
    FirebasePushProvider,
    {
      provide: PUSH_PROVIDER,
      useFactory: pushProviderFactory,
      inject: [ConfigService, NoopPushProvider, FirebasePushProvider],
    },
  ],
  exports: [NotificationService, NotificationsGateway, PushNotificationHooks],
})
export class NotificationsModule {}
