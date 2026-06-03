import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityModule } from '../../common/security/security.module';
import { NotificationService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { StaffNotificationsController } from './staff-notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { PushDeliveryService } from './push/push-delivery.service';
import { FirebasePushProvider } from './push/firebase-push.provider';
import { ApplePushProvider } from './push/apple-push.provider';
import { NoopPushProvider } from './push/noop-push.provider';
import { PUSH_PROVIDER } from './push/push-provider.interface';

function pushProviderFactory(config: ConfigService) {
  const explicit = config.get<string>('PUSH_PROVIDER');
  const hasFirebase =
    !!config.get<string>('FIREBASE_PROJECT_ID') ||
    !!config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ||
    !!config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

  const provider = explicit ?? (hasFirebase ? 'firebase' : 'noop');
  if (provider === 'firebase') return new FirebasePushProvider(config);
  if (provider === 'apns') return new ApplePushProvider();
  return new NoopPushProvider();
}

@Module({
  imports: [SecurityModule],
  controllers: [NotificationsController, StaffNotificationsController],
  providers: [
    NotificationService,
    NotificationsGateway,
    PushDeliveryService,
    FirebasePushProvider,
    ApplePushProvider,
    NoopPushProvider,
    {
      provide: PUSH_PROVIDER,
      useFactory: pushProviderFactory,
      inject: [ConfigService],
    },
  ],
  exports: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
