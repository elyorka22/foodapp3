import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerAuthProvider, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { AuditService } from '../audit/audit.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/utils/phone.util';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { AdminCustomersQueryDto } from './dto/admin-customers-query.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { CustomerTokenService } from './customer-token.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private adminNotifications: AdminNotificationsService,
    private bruteForce: BruteForceService,
    private customerTokens: CustomerTokenService,
  ) {}

  async register(dto: RegisterCustomerDto, clientIp: string) {
    const phone = normalizePhone(dto.phone);
    await this.bruteForce.assertNotBlocked('customer-auth', `${clientIp}:${phone}`);

    const existing = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Phone already registered. Please log in.');
    }

    const customer = await this.prisma.customer.create({
      data: {
        phone,
        fullName: dto.fullName.trim(),
        email: dto.email?.trim() || null,
        authProvider: CustomerAuthProvider.PHONE,
      },
      include: { loyalty: true },
    });

    await this.bruteForce.clearFailures('customer-auth', `${clientIp}:${phone}`);
    return this.customerTokens.issueToken(customer);
  }

  async login(dto: LoginCustomerDto, clientIp: string) {
    const phone = normalizePhone(dto.phone);
    const scopeKey = `${clientIp}:${phone}`;
    await this.bruteForce.assertNotBlocked('customer-auth', scopeKey);

    const customer = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
      include: { loyalty: true },
    });
    if (!customer) {
      await this.bruteForce.recordFailure('customer-auth', scopeKey);
      throw new NotFoundException('Account not found. Please register first.');
    }
    if (!customer.isActive) {
      throw new ForbiddenException('Account is blocked. Contact support.');
    }

    const updated =
      customer.authProvider === CustomerAuthProvider.PHONE
        ? customer
        : await this.prisma.customer.update({
            where: { id: customer.id },
            data: { authProvider: customer.authProvider ?? CustomerAuthProvider.PHONE },
            include: { loyalty: true },
          });

    await this.bruteForce.clearFailures('customer-auth', scopeKey);
    return this.customerTokens.issueToken(updated);
  }

  async findMe(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      include: { loyalty: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return { user: this.customerTokens.serialize(customer) };
  }

  async completeProfile(customerId: string, dto: CompleteProfileDto) {
    const phone = normalizePhone(dto.phone);
    const current = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      include: { loyalty: true },
    });
    if (!current) throw new NotFoundException('Customer not found');

    if (current.phone === phone) {
      const customer = await this.prisma.customer.update({
        where: { id: current.id },
        data: {
          ...(dto.deliveryAddress && {
            defaultDeliveryAddress: dto.deliveryAddress.trim(),
            defaultLatitude: dto.latitude,
            defaultLongitude: dto.longitude,
          }),
        },
        include: { loyalty: true },
      });
      return this.customerTokens.issueToken(customer);
    }

    let targetId = current.id;

    const other = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null, NOT: { id: customerId } },
    });

    if (other) {
      if (current.telegramId) {
        targetId = current.id;
        await this.mergeCustomers(targetId, other.id);
      } else if (other.telegramId) {
        targetId = other.id;
        await this.mergeCustomers(targetId, current.id);
      } else {
        targetId = other.id;
        await this.mergeCustomers(targetId, current.id);
      }
    }

    const data: Prisma.CustomerUpdateInput = {
      phone,
      authProvider: current.telegramId
        ? CustomerAuthProvider.TELEGRAM
        : CustomerAuthProvider.PHONE,
      ...(dto.deliveryAddress && {
        defaultDeliveryAddress: dto.deliveryAddress.trim(),
        defaultLatitude: dto.latitude,
        defaultLongitude: dto.longitude,
      }),
    };

    const customer = await this.prisma.customer.update({
      where: { id: targetId },
      data,
      include: { loyalty: true },
    });

    return this.customerTokens.issueToken(customer);
  }

  /** Merge source customer into target; target survives. Priority: telegramId account. */
  async mergeCustomers(targetId: string, sourceId: string) {
    if (targetId === sourceId) return;

    const [target, source] = await Promise.all([
      this.prisma.customer.findFirst({ where: { id: targetId, deletedAt: null } }),
      this.prisma.customer.findFirst({ where: { id: sourceId, deletedAt: null } }),
    ]);
    if (!target || !source) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.guestOrder.updateMany({
        where: { customerId: sourceId },
        data: { customerId: targetId },
      });

      if (source.phone) {
        await tx.guestOrder.updateMany({
          where: { phone: source.phone, customerId: null },
          data: { customerId: targetId },
        });
      }

      const telegramPatch: Prisma.CustomerUpdateInput = {};
      if (!target.telegramId && source.telegramId) {
        telegramPatch.telegramId = source.telegramId;
        telegramPatch.telegramUsername = source.telegramUsername;
        telegramPatch.telegramFirstName = source.telegramFirstName;
        telegramPatch.telegramLastName = source.telegramLastName;
        telegramPatch.telegramPhotoUrl = source.telegramPhotoUrl;
        telegramPatch.isTelegramVerified = source.isTelegramVerified;
        telegramPatch.lastTelegramLoginAt = source.lastTelegramLoginAt;
      }
      if (!target.phone && source.phone) telegramPatch.phone = source.phone;
      if (!target.email && source.email) telegramPatch.email = source.email;
      if (Object.keys(telegramPatch).length) {
        await tx.customer.update({ where: { id: targetId }, data: telegramPatch });
      }

      await tx.customer.update({
        where: { id: sourceId },
        data: {
          deletedAt: new Date(),
          telegramId: null,
          phone: source.phone ? `${source.phone}_merged_${sourceId.slice(0, 8)}` : null,
        },
      });
    });
  }

  async findByIdVerified(id: string, phoneRaw: string) {
    const phone = normalizePhone(phoneRaw);
    const customer = await this.prisma.customer.findFirst({
      where: { id, phone, deletedAt: null },
      include: { loyalty: true },
    });
    if (!customer) {
      throw new UnauthorizedException('Customer not found or phone mismatch');
    }
    return { customer: this.customerTokens.serialize(customer) };
  }

  async findAllAdmin(query: AdminCustomersQueryDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { telegramUsername: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const statsMap = await this.getCustomerStatsBatch(
      rows.map((c) => ({ id: c.id, phone: c.phone })),
    );
    const data = rows.map((c) => ({
      ...this.customerTokens.serialize(c),
      stats: statsMap.get(c.id) ?? {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      },
    }));

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findAdminById(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const stats = await this.getCustomerStats(id, customer.phone);
    const addresses = await this.getAddresses(id, customer.phone);
    const orders = await this.getOrderHistory(id, customer.phone);

    return {
      customer: this.customerTokens.serialize(customer),
      stats,
      addresses,
      orders,
    };
  }

  async updateStatus(id: string, isActive: boolean, userId?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const updated = await this.prisma.customer.update({
      where: { id },
      data: { isActive },
    });

    await this.audit.log({
      userId,
      action: isActive ? 'unblock' : 'block',
      entity: 'customer',
      entityId: id,
    });

    if (!isActive) {
      await this.adminNotifications.notifyCustomerBlocked({
        id,
        name: customer.fullName,
      });
    }

    return { customer: this.customerTokens.serialize(updated) };
  }

  async getHistory(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const stats = await this.getCustomerStats(id, customer.phone);
    const orders = await this.getOrderHistory(id, customer.phone);

    return { stats, orders };
  }

  async assertCustomerCanOrder(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null, isActive: true },
    });
    if (!customer?.phone) {
      throw new BadRequestException(
        'Phone number is required to place orders. Complete your profile first.',
      );
    }
    return customer;
  }

  private orderWhereForCustomer(
    customerId: string,
    phone: string | null,
  ): Prisma.OrderWhereInput {
    const guestOr: Prisma.GuestOrderWhereInput[] = [{ customerId }];
    if (phone) guestOr.push({ phone });
    return {
      deletedAt: null,
      guestOrder: { OR: guestOr },
    };
  }

  private async getCustomerStatsBatch(
    customers: { id: string; phone: string | null }[],
  ): Promise<
    Map<
      string,
      {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalSpent: number;
        lastOrderDate: Date | null;
      }
    >
  > {
    const result = new Map<
      string,
      {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalSpent: number;
        lastOrderDate: Date | null;
      }
    >();
    if (!customers.length) return result;

    for (const c of customers) {
      result.set(c.id, {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      });
    }

    const ids = customers.map((c) => c.id);
    const phones = customers.map((c) => c.phone).filter((p): p is string => !!p);
    const phoneToId = new Map(
      customers.filter((c) => c.phone).map((c) => [c.phone!, c.id]),
    );

    const guestOr: Prisma.GuestOrderWhereInput[] = [{ customerId: { in: ids } }];
    if (phones.length) guestOr.push({ phone: { in: phones } });

    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        guestOrder: { OR: guestOr },
      },
      select: {
        status: true,
        total: true,
        createdAt: true,
        guestOrder: { select: { customerId: true, phone: true } },
      },
    });

    for (const order of orders) {
      const g = order.guestOrder;
      const customerId =
        g.customerId && ids.includes(g.customerId)
          ? g.customerId
          : g.phone
            ? phoneToId.get(g.phone)
            : undefined;
      if (!customerId) continue;

      const stats = result.get(customerId)!;
      stats.totalOrders += 1;
      if (order.status === OrderStatus.DELIVERED) {
        stats.completedOrders += 1;
        stats.totalSpent += Number(order.total);
      }
      if (order.status === OrderStatus.CANCELLED) stats.cancelledOrders += 1;
      if (!stats.lastOrderDate || order.createdAt > stats.lastOrderDate) {
        stats.lastOrderDate = order.createdAt;
      }
    }

    return result;
  }

  private async getCustomerStats(customerId: string, phone: string | null) {
    const where = this.orderWhereForCustomer(customerId, phone);

    const [totalOrders, completedOrders, cancelledOrders, spentAgg, lastOrder] =
      await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.count({
          where: { ...where, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({
          where: { ...where, status: OrderStatus.CANCELLED },
        }),
        this.prisma.order.aggregate({
          where: { ...where, status: OrderStatus.DELIVERED },
          _sum: { total: true },
        }),
        this.prisma.order.findFirst({
          where,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalSpent: Number(spentAgg._sum.total ?? 0),
      lastOrderDate: lastOrder?.createdAt ?? null,
    };
  }

  private async getAddresses(customerId: string, phone: string | null) {
    const guestOr: Prisma.GuestOrderWhereInput[] = [{ customerId }];
    if (phone) guestOr.push({ phone });

    const guestOrders = await this.prisma.guestOrder.findMany({
      where: { OR: guestOr },
      select: {
        deliveryAddress: true,
        latitude: true,
        longitude: true,
      },
      distinct: ['deliveryAddress'],
      take: 20,
    });

    return guestOrders.map((g) => ({
      line1: g.deliveryAddress,
      latitude: Number(g.latitude),
      longitude: Number(g.longitude),
    }));
  }

  private async getOrderHistory(customerId: string, phone: string | null) {
    const orders = await this.prisma.order.findMany({
      where: this.orderWhereForCustomer(customerId, phone),
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        business: { select: { name: true } },
        guestOrder: true,
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      restaurantName: o.business.name,
      createdAt: o.createdAt,
      deliveryAddress: o.guestOrder.deliveryAddress,
    }));
  }
}
