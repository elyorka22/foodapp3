import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BasePushProvider } from './base-push.provider';
import { PushMessagePayload } from './push-provider.interface';

@Injectable()
export class NoopPushProvider extends BasePushProvider {
  readonly name = 'noop';
  protected readonly logger = new Logger(NoopPushProvider.name);

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected async deliverToToken(
    pushToken: string,
    message: PushMessagePayload,
  ): Promise<void> {
    this.logger.debug(
      `[noop] ${message.title} → ${pushToken.slice(0, 12)}…`,
    );
  }
}
