import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
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
  ) {
    super(prisma);
  }

  onModuleInit() {
    const provider = (this.config.get<string>('PUSH_PROVIDER') ?? 'noop').toLowerCase();
    if (provider !== 'firebase') {
      this.logger.log('PUSH_PROVIDER is not firebase — FCM transport idle');
      return;
    }
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (this.messaging) return;

    try {
      const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
      const jsonRaw = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
      const credPath = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

      let app: admin.app.App;

      if (jsonRaw?.trim()) {
        const serviceAccount = JSON.parse(jsonRaw) as admin.ServiceAccount;
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId ?? serviceAccount.projectId,
        });
      } else if (credPath?.trim()) {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: projectId ?? undefined,
        });
      } else {
        this.logger.error(
          'Firebase Admin not configured: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS',
        );
        return;
      }

      this.messaging = admin.messaging(app);
      this.logger.log(
        `Firebase Admin SDK initialized (project: ${app.options.projectId ?? 'unknown'})`,
      );
    } catch (err) {
      this.logger.error(`Firebase Admin initialization failed: ${err}`);
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

    const fcmMessage: admin.messaging.Message = {
      token: pushToken,
      notification: {
        title: message.title,
        body: message.body,
      },
      data: {
        ...(message.data ?? {}),
        title: message.title,
        body: message.body,
      },
      android: {
        priority: 'high',
        ttl: 86_400_000,
        notification: {
          channelId,
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public',
          priority: 'max',
          notificationCount: 1,
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
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
      this.logger.debug(
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
