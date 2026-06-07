import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DevicePlatform,
  DeviceRole,
  NotificationAccountType,
  NotificationChannelCode,
  Prisma,
  UserRole,
} from '@prisma/client';
import { normalizePhone } from '../../../common/utils/phone.util';
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
  userId?: string;
  accountType: NotificationAccountType;
  userRole?: UserRole;
  notificationId: string;
  type: NotificationChannelCode;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  guestPhone?: string;
  guestDeviceId?: string;
};

@Injectable()
export class PushDeliveryService {
  private readonly logger = new Logger(PushDeliveryService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(PUSH_PROVIDER) private pushProvider: PushProvider,
  ) {}

  async deliverNotification(params: DeliverNotificationParams) {
    const data = buildPushDataPayload({
      notificationId: params.notificationId,
      type: params.type,
      userId: params.userId ?? 'guest',
      accountType: params.accountType,
      metadata: params.metadata,
    });

    const message: PushMessagePayload = {
      title: params.title,
      body: params.body,
      data,
    };

    try {
      if (params.accountType === NotificationAccountType.CUSTOMER) {
        const tokens = await this.collectCustomerPushTokens({
          userId: params.userId,
          phone: params.guestPhone,
          deviceId: params.guestDeviceId,
        });
        await this.pushProvider.sendToTokens(tokens, message);
        return;
      }

      if (!params.userId) return;

      const role = resolveDeviceRole(params.accountType, params.userRole);
      await this.pushProvider.sendToUser({ userId: params.userId, role }, message);
    } catch (err) {
      if (err instanceof InvalidPushTokenError) {
        await this.clearTokenByValue(err.pushToken);
        return;
      }
      this.logger.warn(`Push delivery failed: ${err}`);
    }
  }

  /** Push-only delivery for guests (no in-app notification row). */
  async deliverGuestPush(params: {
    phone: string;
    deviceId?: string;
    type: NotificationChannelCode;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
  }) {
    const data = buildPushDataPayload({
      notificationId: 'guest',
      type: params.type,
      userId: 'guest',
      accountType: NotificationAccountType.CUSTOMER,
      metadata: params.metadata,
    });

    const tokens = await this.collectCustomerPushTokens({
      phone: params.phone,
      deviceId: params.deviceId,
    });
    if (!tokens.length) {
      this.logger.debug(
        `Guest push skipped — no tokens (phone=${params.phone}, device=${params.deviceId ?? 'n/a'})`,
      );
      return;
    }

    await this.pushProvider.sendToTokens(tokens, {
      title: params.title,
      body: params.body,
      data,
    });
  }

  async deliverDirectPush(params: {
    tokens: string[];
    title: string;
    body: string;
    type: NotificationChannelCode;
    metadata?: Record<string, unknown>;
  }) {
    const data = buildPushDataPayload({
      notificationId: 'broadcast',
      type: params.type,
      userId: 'broadcast',
      accountType: NotificationAccountType.CUSTOMER,
      metadata: params.metadata,
    });

    await this.pushProvider.sendToTokens(params.tokens, {
      title: params.title,
      body: params.body,
      data,
    });
  }

  async registerGuestDevice(params: {
    deviceId: string;
    platform: DevicePlatform;
    pushToken?: string;
    appVersion?: string;
    phone?: string;
  }) {
    return this.registerDevice({
      accountType: NotificationAccountType.CUSTOMER,
      role: DeviceRole.CUSTOMER,
      deviceId: params.deviceId,
      platform: params.platform,
      pushToken: params.pushToken,
      appVersion: params.appVersion,
      phone: params.phone,
    });
  }

  async registerDevice(params: {
    userId?: string;
    accountType: NotificationAccountType;
    role: DeviceRole;
    deviceId: string;
    platform: DevicePlatform;
    pushToken?: string;
    appVersion?: string;
    phone?: string;
  }) {
    const phone = params.phone?.trim() ? normalizePhone(params.phone) : undefined;

    return this.prisma.userDevice.upsert({
      where: {
        deviceId_accountType: {
          deviceId: params.deviceId,
          accountType: params.accountType,
        },
      },
      create: {
        userId: params.userId ?? null,
        accountType: params.accountType,
        role: params.role,
        deviceId: params.deviceId,
        platform: params.platform,
        pushToken: params.pushToken,
        appVersion: params.appVersion,
        phone: phone ?? null,
        lastSeenAt: new Date(),
      },
      update: {
        ...(params.userId ? { userId: params.userId } : {}),
        role: params.role,
        pushToken: params.pushToken ?? undefined,
        appVersion: params.appVersion ?? undefined,
        platform: params.platform,
        ...(phone ? { phone } : {}),
        lastSeenAt: new Date(),
      },
    });
  }

  async linkDevicePhone(deviceId: string, phone: string) {
    const normalized = normalizePhone(phone);
    return this.prisma.userDevice.updateMany({
      where: {
        deviceId,
        accountType: NotificationAccountType.CUSTOMER,
      },
      data: { phone: normalized, lastSeenAt: new Date() },
    });
  }

  async clearDevicePushToken(params: {
    accountType: NotificationAccountType;
    deviceId: string;
    clearUserLink?: boolean;
  }) {
    const row = await this.prisma.userDevice.findUnique({
      where: {
        deviceId_accountType: {
          deviceId: params.deviceId,
          accountType: params.accountType,
        },
      },
    });
    if (!row) return { ok: true };

    await this.prisma.userDevice.update({
      where: { id: row.id },
      data: {
        pushToken: null,
        ...(params.clearUserLink ? { userId: null, phone: null } : {}),
      },
    });
    return { ok: true };
  }

  async listGuestPushTokens(): Promise<string[]> {
    const devices = await this.prisma.userDevice.findMany({
      where: {
        accountType: NotificationAccountType.CUSTOMER,
        role: DeviceRole.CUSTOMER,
        userId: null,
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });
    return this.uniqueTokens(devices);
  }

  private async collectCustomerPushTokens(filters: {
    userId?: string;
    phone?: string;
    deviceId?: string;
  }): Promise<string[]> {
    const or: Prisma.UserDeviceWhereInput[] = [];

    if (filters.userId) {
      or.push({
        userId: filters.userId,
        role: DeviceRole.CUSTOMER,
        pushToken: { not: null },
      });
    }

    if (filters.phone) {
      or.push({
        phone: normalizePhone(filters.phone),
        accountType: NotificationAccountType.CUSTOMER,
        pushToken: { not: null },
      });
    }

    if (filters.deviceId) {
      or.push({
        deviceId: filters.deviceId,
        accountType: NotificationAccountType.CUSTOMER,
        pushToken: { not: null },
      });
    }

    if (!or.length) return [];

    const devices = await this.prisma.userDevice.findMany({
      where: { OR: or },
      select: { pushToken: true },
    });

    return this.uniqueTokens(devices);
  }

  private uniqueTokens(devices: { pushToken: string | null }[]): string[] {
    return [
      ...new Set(
        devices
          .map((d) => d.pushToken?.trim())
          .filter((token): token is string => !!token),
      ),
    ];
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
