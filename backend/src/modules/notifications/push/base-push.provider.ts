import { Logger } from '@nestjs/common';
import { DeviceRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { InvalidPushTokenError } from './invalid-push-token.error';
import {
  PushMessagePayload,
  PushProvider,
  PushUserTarget,
} from './push-provider.interface';

/** Shared device lookup for all push transport providers. */
export abstract class BasePushProvider implements PushProvider {
  protected abstract readonly logger: Logger;

  constructor(protected readonly prisma: PrismaService) {}

  abstract readonly name: string;

  async sendToUser(target: PushUserTarget, message: PushMessagePayload): Promise<void> {
    const tokens = await this.loadPushTokens(target);
    if (!tokens.length) {
      this.logger.debug(
        `[${this.name}] sendToUser ${target.userId} (${target.role}): no push tokens`,
      );
      return;
    }
    await Promise.all(
      tokens.map((token) =>
        this.deliverToToken(token, message).catch(async (err) => {
          if (err instanceof InvalidPushTokenError) {
            await this.clearInvalidToken(err.pushToken);
            return;
          }
          this.logger.warn(
            `[${this.name}] token delivery failed for ${target.userId}: ${err}`,
          );
        }),
      ),
    );
  }

  async sendToMany(
    targets: PushUserTarget[],
    message: PushMessagePayload,
  ): Promise<void> {
    this.logger.debug(
      `[${this.name}] sendToMany → ${targets.length} recipient(s): "${message.title}"`,
    );
    await Promise.all(targets.map((target) => this.sendToUser(target, message)));
  }

  private async clearInvalidToken(pushToken: string) {
    await this.prisma.userDevice.updateMany({
      where: { pushToken },
      data: { pushToken: null },
    });
    this.logger.log(`Cleared invalid push token ${pushToken.slice(0, 12)}…`);
  }

  protected abstract deliverToToken(
    pushToken: string,
    message: PushMessagePayload,
  ): Promise<void>;

  private async loadPushTokens(target: PushUserTarget): Promise<string[]> {
    const devices = await this.prisma.userDevice.findMany({
      where: {
        userId: target.userId,
        role: target.role as DeviceRole,
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });
    return devices
      .map((d) => d.pushToken)
      .filter((token): token is string => !!token?.trim());
  }
}
