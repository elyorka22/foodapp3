import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DevicePlatform,
  DeviceRole,
  NotificationAccountType,
  NotificationChannelCode,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { buildPushDataPayload } from './push-payload.util';
import { InvalidPushTokenError } from './invalid-push-token.error';
import {
  PUSH_PROVIDER,
  PushDeviceRole,
  PushMessagePayload,
  PushProvider,
} from './push-provider.interface';

export type DeliverNotificationParams = {
  userId: string;
  accountType: NotificationAccountType;
  userRole?: UserRole;
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
    const role = resolveDeviceRole(params.accountType, params.userRole);
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

    try {
      await this.pushProvider.sendToUser(
        { userId: params.userId, role },
        message,
      );
    } catch (err) {
      if (err instanceof InvalidPushTokenError) {
        await this.clearTokenByValue(err.pushToken);
        return;
      }
      this.logger.warn(`Push delivery failed for ${params.userId}: ${err}`);
    }
  }

  async registerDevice(params: {
    userId: string;
    accountType: NotificationAccountType;
    role: DeviceRole;
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
        role: params.role,
        deviceId: params.deviceId,
        platform: params.platform,
        pushToken: params.pushToken,
        appVersion: params.appVersion,
        lastSeenAt: new Date(),
      },
      update: {
        role: params.role,
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

  private async clearTokenByValue(pushToken: string) {
    await this.prisma.userDevice.updateMany({
      where: { pushToken },
      data: { pushToken: null },
    });
    this.logger.log(`Cleared invalid push token ${pushToken.slice(0, 12)}…`);
  }
}

export function resolveDeviceRole(
  accountType: NotificationAccountType,
  userRole?: UserRole,
): PushDeviceRole {
  if (accountType === NotificationAccountType.CUSTOMER) {
    return 'CUSTOMER';
  }
  if (userRole === UserRole.COURIER) {
    return 'COURIER';
  }
  return 'STAFF';
}

export function deviceRoleForStaffUser(userRole: UserRole | string): DeviceRole {
  return userRole === UserRole.COURIER ? DeviceRole.COURIER : DeviceRole.STAFF;
}
