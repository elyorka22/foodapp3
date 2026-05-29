import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { AuditService } from '../audit/audit.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/utils/phone.util';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { AdminCustomersQueryDto } from './dto/admin-customers-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private adminNotifications: AdminNotificationsService,
    private bruteForce: BruteForceService,
  ) {}

  private serialize(customer: {
    id: string;
    phone: string;
    fullName: string;
    email: string | null;
    isActive: boolean;
    referralCode?: string | null;
    createdAt: Date;
    loyalty?: { points: number; level: string } | null;
  }) {
    return {
      id: customer.id,
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email ?? undefined,
      isActive: customer.isActive,
      referralCode: customer.referralCode ?? undefined,
      loyalty: customer.loyalty
        ? { points: customer.loyalty.points, level: customer.loyalty.level }
        : undefined,
      createdAt: customer.createdAt,
    };
  }

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
      },
      include: { loyalty: true },
    });

    await this.bruteForce.clearFailures('customer-auth', `${clientIp}:${phone}`);
    return { customer: this.serialize(customer) };
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

    await this.bruteForce.clearFailures('customer-auth', scopeKey);
    return { customer: this.serialize(customer) };
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
    return { customer: this.serialize(customer) };
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

    const statsMap = await this.getCustomerStatsBatch(rows.map((c) => ({ id: c.id, phone: c.phone })));
    const data = rows.map((c) => ({
      ...this.serialize(c),
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
      customer: this.serialize(customer),
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

    return { customer: this.serialize(updated) };
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

  private orderWhereForCustomer(customerId: string, phone: string): Prisma.OrderWhereInput {
    return {
      deletedAt: null,
      guestOrder: {
        OR: [{ customerId }, { phone }],
      },
    };
  }

  private async getCustomerStatsBatch(
    customers: { id: string; phone: string }[],
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
    const phones = customers.map((c) => c.phone);
    const phoneToId = new Map(customers.map((c) => [c.phone, c.id]));

    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        guestOrder: {
          OR: [{ customerId: { in: ids } }, { phone: { in: phones } }],
        },
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
        g.customerId && ids.includes(g.customerId) ? g.customerId : phoneToId.get(g.phone);
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

  private async getCustomerStats(customerId: string, phone: string) {
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

  private async getAddresses(customerId: string, phone: string) {
    const guestOrders = await this.prisma.guestOrder.findMany({
      where: {
        OR: [{ customerId }, { phone }],
      },
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

  private async getOrderHistory(customerId: string, phone: string) {
    const orders = await this.prisma.order.findMany({
      where: this.orderWhereForCustomer(customerId, phone),
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        restaurant: { select: { name: true } },
        guestOrder: true,
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      restaurantName: o.restaurant.name,
      createdAt: o.createdAt,
      deliveryAddress: o.guestOrder.deliveryAddress,
    }));
  }
}
