import { Injectable, Logger } from '@nestjs/common';
import { PushMessagePayload, PushProvider } from './push-provider.interface';

/** Apple Push Notification service transport (future native iOS). */
@Injectable()
export class ApplePushProvider implements PushProvider {
  readonly name = 'apns';
  private readonly logger = new Logger(ApplePushProvider.name);

  async send(pushToken: string, message: PushMessagePayload): Promise<void> {
    this.logger.log(`[APNs stub] ${message.title} → ${pushToken.slice(0, 16)}…`);
  }
}
