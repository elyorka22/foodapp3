import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DevicePlatform,
  NotificationAccountType,
  NotificationChannelCode,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { buildPushDataPayload } from './push-payload.util';
import { InvalidPushTokenError } from './firebase-push.provider';
import { PUSH_PROVIDER, PushMessagePayload, PushProvider } from './push-provider.interface';

export type DeliverNotificationParams = {
  userId: string;
  accountType: NotificationAccountType;
  notificationId: string;
  type: NotificationChannelCode;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class PushDeliveryService {
  private readonly logger = new Logger(PushDeliveryService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(PUSH_PROVIDER) private pushProvider: PushProvider,
  ) {}

  async deliverNotification(params: DeliverNotificationParams) {
    const devices = await this.prisma.userDevice.findMany({
      where: {
        userId: params.userId,
        accountType: params.accountType,
        pushToken: { not: null },
      },
    });

    if (!devices.length) return;

    const data = buildPushDataPayload({
      notificationId: params.notificationId,
      type: params.type,
      userId: params.userId,
      accountType: params.accountType,
      metadata: params.metadata,
    });

    const message: PushMessagePayload = {
      title: params.title,
      body: params.body,
      data,
    };

    await Promise.all(
      devices.map((device) =>
        this.sendToDevice(device.id, device.pushToken!, message).catch((err) => {
          this.logger.warn(`Push failed for device ${device.deviceId}: ${err}`);
        }),
      ),
    );
  }

  private async sendToDevice(
    deviceRowId: string,
    pushToken: string,
    message: PushMessagePayload,
  ) {
    try {
      await this.pushProvider.send(pushToken, message);
    } catch (err) {
      if (err instanceof InvalidPushTokenError) {
        await this.prisma.userDevice.update({
          where: { id: deviceRowId },
          data: { pushToken: null },
        });
        this.logger.log(`Cleared invalid FCM token for device row ${deviceRowId}`);
        return;
      }
      throw err;
    }
  }

  async registerDevice(params: {
    userId: string;
    accountType: NotificationAccountType;
    deviceId: string;
    platform: DevicePlatform;
    pushToken?: string;
    appVersion?: string;
  }) {
    return this.prisma.userDevice.upsert({
      where: {
        userId_accountType_deviceId: {
          userId: params.userId,
          accountType: params.accountType,
          deviceId: params.deviceId,
        },
      },
      create: {
        userId: params.userId,
        accountType: params.accountType,
        deviceId: params.deviceId,
        platform: params.platform,
        pushToken: params.pushToken,
        appVersion: params.appVersion,
        lastSeenAt: new Date(),
      },
      update: {
        pushToken: params.pushToken ?? undefined,
        appVersion: params.appVersion ?? undefined,
        platform: params.platform,
        lastSeenAt: new Date(),
      },
    });
  }

  async clearDevicePushToken(params: {
    userId: string;
    accountType: NotificationAccountType;
    deviceId: string;
  }) {
    const row = await this.prisma.userDevice.findUnique({
      where: {
        userId_accountType_deviceId: {
          userId: params.userId,
          accountType: params.accountType,
          deviceId: params.deviceId,
        },
      },
    });
    if (!row) return { ok: true };
    await this.prisma.userDevice.update({
      where: { id: row.id },
      data: { pushToken: null },
    });
    return { ok: true };
  }
}
