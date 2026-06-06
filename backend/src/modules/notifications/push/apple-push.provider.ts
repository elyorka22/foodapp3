import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BasePushProvider } from './base-push.provider';
import { PushMessagePayload } from './push-provider.interface';

/** APNs transport stub — not enabled in v1. */
@Injectable()
export class ApplePushProvider extends BasePushProvider {
  readonly name = 'apns';
  protected readonly logger = new Logger(ApplePushProvider.name);

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected async deliverToToken(
    pushToken: string,
    message: PushMessagePayload,
  ): Promise<void> {
    this.logger.debug(
      `[apns-stub] would send "${message.title}" → ${pushToken.slice(0, 12)}…`,
    );
  }
}
