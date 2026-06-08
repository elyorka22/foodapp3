import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseAdminService } from '../../../common/firebase/firebase-admin.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BasePushProvider } from './base-push.provider';
import { InvalidPushTokenError } from './invalid-push-token.error';
import { PushMessagePayload } from './push-provider.interface';

const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

/** FCM transport via Firebase Admin SDK. */
@Injectable()
export class FirebasePushProvider extends BasePushProvider implements OnModuleInit {
  readonly name = 'firebase';
  protected readonly logger = new Logger(FirebasePushProvider.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(
    prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {
    super(prisma);
  }

  onModuleInit() {
    const provider = (this.config.get<string>('PUSH_PROVIDER') ?? 'noop').toLowerCase();
    if (provider !== 'firebase') {
      this.logger.log('PUSH_PROVIDER is not firebase — FCM transport idle');
      return;
    }
    this.messaging = this.firebaseAdmin.getMessaging();
    if (!this.messaging) {
      this.logger.error('FCM transport idle — Firebase Admin not configured');
    }
  }

  protected async deliverToToken(
    pushToken: string,
    message: PushMessagePayload,
  ): Promise<void> {
    if (!this.messaging) {
      this.logger.warn('FCM send skipped — Firebase Admin not initialized');
      return;
    }

    const notificationType = message.data?.type ?? '';
    const isCourierUrgent =
      notificationType === 'ORDER_ASSIGNED' || notificationType === 'NEW_ORDER';
    const channelId = isCourierUrgent ? 'foodapp_courier_urgent' : 'foodapp_default';

    const dataPayload: Record<string, string> = {
      ...(message.data ?? {}),
      title: message.title,
      body: message.body,
      channelId,
    };

    // Data-only on Android — app shows tray notification via flutter_local_notifications.
    // iOS uses APNs alert payload for lock-screen display.
    const fcmMessage: admin.messaging.Message = {
      token: pushToken,
      data: dataPayload,
      android: {
        priority: 'high',
        ttl: 86_400_000,
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title: message.title,
              body: message.body,
            },
          },
        },
      },
    };

    try {
      const messageId = await this.messaging.send(fcmMessage);
      this.logger.log(
        `FCM delivered "${message.title}" → ${pushToken.slice(0, 12)}… (${messageId})`,
      );
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code && INVALID_TOKEN_CODES.has(code)) {
        throw new InvalidPushTokenError(`FCM rejected token (${code})`, pushToken);
      }
      this.logger.error(
        `FCM delivery failed for ${pushToken.slice(0, 12)}…: ${err}`,
      );
      throw err;
    }
  }
}
