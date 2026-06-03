import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PushMessagePayload, PushProvider } from './push-provider.interface';

export class InvalidPushTokenError extends Error {
  constructor(
    message: string,
    readonly pushToken: string,
  ) {
    super(message);
    this.name = 'InvalidPushTokenError';
  }
}

/**
 * Firebase Cloud Messaging transport — delivers title/body/data only.
 * FoodApp NotificationService owns templates, history, and routing metadata.
 */
@Injectable()
export class FirebasePushProvider implements PushProvider, OnModuleInit {
  readonly name = 'firebase';
  private readonly logger = new Logger(FirebasePushProvider.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.messaging = admin.messaging();
      return;
    }

    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const rawJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    const credentialsPath = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

    if (!projectId && !rawJson && !credentialsPath) {
      this.logger.warn('FCM not configured — set FIREBASE_PROJECT_ID + credentials');
      return;
    }

    try {
      if (rawJson?.trim()) {
        const serviceAccount = JSON.parse(rawJson) as admin.ServiceAccount;
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId ?? serviceAccount.projectId,
        });
      } else if (credentialsPath?.trim()) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: projectId,
        });
      } else {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS required');
        return;
      }
      this.messaging = admin.messaging();
      this.logger.log('Firebase Admin initialized for FCM delivery');
    } catch (err) {
      this.logger.error(`Firebase Admin init failed: ${err}`);
    }
  }

  private isReady(): boolean {
    return this.messaging != null;
  }

  async send(pushToken: string, message: PushMessagePayload): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn(
        `FCM skipped (not initialized): ${message.title} → ${pushToken.slice(0, 16)}…`,
      );
      return;
    }

    const data = message.data ?? {};
    try {
      await this.messaging!.send({
        token: pushToken,
        notification: {
          title: message.title,
          body: message.body,
        },
        data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'foodapp_default',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title: message.title, body: message.body },
              sound: 'default',
              contentAvailable: true,
            },
          },
        },
      });
      this.logger.debug(`FCM sent: ${message.title} → ${pushToken.slice(0, 16)}…`);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        throw new InvalidPushTokenError(String(err), pushToken);
      }
      this.logger.error(`FCM send failed: ${err}`);
      throw err;
    }
  }
}
