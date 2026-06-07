import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationAccountType,
  UserRole,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from './notifications.service';
import {
  AdminSendPushDto,
  PushBroadcastAudience,
} from './dto/admin-send-push.dto';

const BATCH_SIZE = 50;
const MAX_RECIPIENTS = 10_000;

type Recipient = {
  userId: string;
  accountType: NotificationAccountType;
  userRole?: UserRole;
};

@Injectable()
export class AdminPushService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private audit: AuditService,
  ) {}

  getAllowedAudiences(role: UserRole): PushBroadcastAudience[] {
    if (role === UserRole.SUPER_ADMIN) {
      return Object.values(PushBroadcastAudience);
    }
    if (role === UserRole.MANAGER) {
      return [
        PushBroadcastAudience.CUSTOMERS,
        PushBroadcastAudience.COURIERS,
        PushBroadcastAudience.USER,
      ];
    }
    return [];
  }

  async getPushStats() {
    const [customerUsers, customerTokens, courierUsers, courierTokens, staffUsers, staffTokens] =
      await Promise.all([
        this.prisma.customer.count({ where: { deletedAt: null, isActive: true } }),
        this.prisma.userDevice.count({
          where: { role: 'CUSTOMER', pushToken: { not: null } },
        }),
        this.prisma.courier.count({
          where: { deletedAt: null, user: { isActive: true, deletedAt: null } },
        }),
        this.prisma.userDevice.count({
          where: { role: 'COURIER', pushToken: { not: null } },
        }),
        this.prisma.user.count({
          where: {
            deletedAt: null,
            isActive: true,
            role: { in: [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS] },
          },
        }),
        this.prisma.userDevice.count({
          where: { role: 'STAFF', pushToken: { not: null } },
        }),
      ]);

    return {
      customers: { users: customerUsers, devicesWithToken: customerTokens },
      couriers: { users: courierUsers, devicesWithToken: courierTokens },
      staff: { users: staffUsers, devicesWithToken: staffTokens },
    };
  }

  async sendBroadcast(senderId: string, senderRole: UserRole, dto: AdminSendPushDto) {
    this.assertAudienceAllowed(senderRole, dto.audience);

    const recipients = await this.resolveRecipients(dto);
    if (!recipients.length) {
      throw new BadRequestException('No recipients found for this audience');
    }
    if (recipients.length > MAX_RECIPIENTS) {
      throw new BadRequestException(
        `Too many recipients (${recipients.length}). Max ${MAX_RECIPIENTS}.`,
      );
    }

    const templateCode = dto.templateCode ?? 'SYSTEM';
    let delivered = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await this.notifications.sendToMany(
        batch,
        templateCode,
        { sentByAdmin: senderId, audience: dto.audience },
        dto.title,
        dto.body,
      );
      delivered += results.filter(Boolean).length;
    }

    await this.audit.log({
      userId: senderId,
      action: 'ADMIN_PUSH_SEND',
      entity: 'notification',
      metadata: {
        audience: dto.audience,
        templateCode,
        title: dto.title,
        recipientCount: recipients.length,
        deliveredCount: delivered,
        targetUserId: dto.userId,
      },
    });

    return {
      ok: true,
      audience: dto.audience,
      recipients: recipients.length,
      delivered,
    };
  }

  private assertAudienceAllowed(senderRole: UserRole, audience: PushBroadcastAudience) {
    const allowed = this.getAllowedAudiences(senderRole);
    if (!allowed.includes(audience)) {
      throw new ForbiddenException(`Your role cannot send push to audience ${audience}`);
    }
  }

  private async resolveRecipients(dto: AdminSendPushDto): Promise<Recipient[]> {
    switch (dto.audience) {
      case PushBroadcastAudience.CUSTOMERS:
        return this.loadCustomers();
      case PushBroadcastAudience.COURIERS:
        return this.loadCouriers();
      case PushBroadcastAudience.STAFF:
        return this.loadStaff();
      case PushBroadcastAudience.ALL:
        return this.dedupeRecipients([
          ...(await this.loadCustomers()),
          ...(await this.loadCouriers()),
          ...(await this.loadStaff()),
        ]);
      case PushBroadcastAudience.USER:
        return this.loadSingleUser(dto);
      default:
        throw new BadRequestException('Unknown audience');
    }
  }

  private async loadCustomers(): Promise<Recipient[]> {
    const rows = await this.prisma.customer.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true },
    });
    return rows.map((row) => ({
      userId: row.id,
      accountType: NotificationAccountType.CUSTOMER,
    }));
  }

  private async loadCouriers(): Promise<Recipient[]> {
    const rows = await this.prisma.courier.findMany({
      where: { deletedAt: null, user: { isActive: true, deletedAt: null } },
      select: { userId: true },
    });
    return rows.map((row) => ({
      userId: row.userId,
      accountType: NotificationAccountType.STAFF,
      userRole: UserRole.COURIER,
    }));
  }

  private async loadStaff(): Promise<Recipient[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        role: { in: [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.BUSINESS] },
      },
      select: { id: true, role: true },
    });
    return rows.map((row) => ({
      userId: row.id,
      accountType: NotificationAccountType.STAFF,
      userRole: row.role,
    }));
  }

  private async loadSingleUser(dto: AdminSendPushDto): Promise<Recipient[]> {
    if (!dto.userId || !dto.accountType) {
      throw new BadRequestException('userId and accountType are required for USER audience');
    }

    if (dto.accountType === NotificationAccountType.CUSTOMER) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.userId, deletedAt: null },
      });
      if (!customer) throw new NotFoundException('Customer not found');
      return [{ userId: customer.id, accountType: NotificationAccountType.CUSTOMER }];
    }

    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null, isActive: true },
    });
    if (!user) throw new NotFoundException('Staff user not found');

    const userRole = dto.userRole ?? user.role;
    if (userRole !== user.role && dto.userRole) {
      throw new BadRequestException('userRole does not match the target user');
    }

    return [
      {
        userId: user.id,
        accountType: NotificationAccountType.STAFF,
        userRole,
      },
    ];
  }

  private dedupeRecipients(recipients: Recipient[]): Recipient[] {
    const seen = new Set<string>();
    return recipients.filter((recipient) => {
      const key = `${recipient.accountType}:${recipient.userId}:${recipient.userRole ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
