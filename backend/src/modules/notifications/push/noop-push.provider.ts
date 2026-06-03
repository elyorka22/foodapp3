import { Injectable, Logger } from '@nestjs/common';
import { PushMessagePayload, PushProvider } from './push-provider.interface';

@Injectable()
export class NoopPushProvider implements PushProvider {
  readonly name = 'noop';
  private readonly logger = new Logger(NoopPushProvider.name);

  async send(pushToken: string, message: PushMessagePayload): Promise<void> {
    this.logger.debug(`[noop] push to ${pushToken.slice(0, 12)}…: ${message.title}`);
  }
}
