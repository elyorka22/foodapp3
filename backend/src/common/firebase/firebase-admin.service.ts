import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/** Shared Firebase Admin SDK — FCM push and Auth ID token verification. */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private initAttempted = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.ensureApp();
  }

  ensureApp(): admin.app.App | null {
    if (admin.apps.length > 0) {
      return admin.apps[0]!;
    }
    if (this.initAttempted) return null;
    this.initAttempted = true;

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
        this.logger.warn(
          'Firebase Admin not configured: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS',
        );
        return null;
      }

      this.logger.log(
        `Firebase Admin SDK initialized (project: ${app.options.projectId ?? 'unknown'})`,
      );
      return app;
    } catch (err) {
      this.logger.error(`Firebase Admin initialization failed: ${err}`);
      return null;
    }
  }

  getAuth(): admin.auth.Auth | null {
    const app = this.ensureApp();
    return app ? admin.auth(app) : null;
  }

  getMessaging(): admin.messaging.Messaging | null {
    const app = this.ensureApp();
    return app ? admin.messaging(app) : null;
  }
}
