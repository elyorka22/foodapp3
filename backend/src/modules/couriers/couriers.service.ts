import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { normalizePhone } from '../../common/utils/phone.util';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { OrdersGateway } from '../orders/orders.gateway';
import { AdminCouriersQueryDto } from './dto/admin-couriers-query.dto';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { CourierStatusDto } from './dto/courier-status.dto';

const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.COURIER_ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.DELIVERING,
];

@Injectable()
export class CouriersService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private audit: AuditService,
    private adminNotifications: AdminNotificationsService,
    private gateway: OrdersGateway,
  ) {}

  async findAllAdmin(query: AdminCouriersQueryDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.CourierWhereInput = {
      deletedAt: null,
      ...(query.isOnline !== undefined && { isOnline: query.isOnline }),
      ...(query.isActive !== undefined && { user: { isActive: query.isActive } }),
      ...(query.search && {
        user: {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.courier.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.courier.count({ where }),
    ]);

    const ids = rows.map((c) => c.id);
    const statsMap = await this.buildStatsMap(ids);

    const data = rows.map((c) => ({
      ...c,
      totalEarnings: Number(c.totalEarnings),
      stats: statsMap.get(c.id),
    }));

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findAll() {
    const result = await this.findAllAdmin({ page: 1, limit: 100 });
    return result.data;
  }

  async create(dto: CreateCourierDto, createdByUserId?: string) {
    const phone = normalizePhone(dto.phone);
    const email = dto.email?.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });
    if (existing) throw new ConflictException('User with this phone or email already exists');

    const passwordHash = await this.auth.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        phone,
        email: email ?? null,
        fullName: dto.fullName.trim(),
        role: UserRole.COURIER,
        passwordHash,
        isActive: true,
      },
    });

    const courier = await this.prisma.courier.create({
      data: {
        userId: user.id,
        vehicleType: dto.vehicleType,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, email: true, isActive: true },
        },
      },
    });

    await this.audit.log({
      userId: createdByUserId,
      action: 'create',
      entity: 'courier',
      entityId: courier.id,
      metadata: { fullName: dto.fullName },
    });
    return { ...courier, totalEarnings: Number(courier.totalEarnings) };
  }

  async findById(id: string) {
    const courier = await this.prisma.courier.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
    if (!courier) throw new NotFoundException('Courier not found');

    const stats = await this.getStats(id);
    const currentOrder = await this.prisma.order.findFirst({
      where: {
        courierId: id,
        deletedAt: null,
        status: { in: ACTIVE_STATUSES },
      },
      include: {
        restaurant: { select: { name: true } },
        guestOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...courier,
      totalEarnings: Number(courier.totalEarnings),
      stats,
      currentOrder,
    };
  }

  async update(id: string, dto: UpdateCourierDto) {
    const courier = await this.prisma.courier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!courier) throw new NotFoundException('Courier not found');

    const userData: Prisma.UserUpdateInput = {};
    if (dto.fullName) userData.fullName = dto.fullName.trim();
    if (dto.phone) userData.phone = normalizePhone(dto.phone);
    if (dto.email !== undefined) userData.email = dto.email?.trim().toLowerCase() || null;

    if (Object.keys(userData).length) {
      await this.prisma.user.update({ where: { id: courier.userId }, data: userData });
    }

    const updated = await this.prisma.courier.update({
      where: { id },
      data: { vehicleType: dto.vehicleType },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, email: true, isActive: true },
        },
      },
    });
    await this.audit.log({
      action: 'update',
      entity: 'courier',
      entityId: id,
      metadata: dto,
    });
    return updated;
  }

  async updateStatus(id: string, dto: CourierStatusDto, userId?: string) {
    const courier = await this.prisma.courier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!courier) throw new NotFoundException('Courier not found');

    const wasOnline = courier.isOnline;

    if (dto.isActive !== undefined) {
      await this.prisma.user.update({
        where: { id: courier.userId },
        data: { isActive: dto.isActive },
      });
      if (!dto.isActive) {
        await this.prisma.courier.update({
          where: { id },
          data: { isOnline: false },
        });
      }
    }

    if (dto.isOnline !== undefined) {
      await this.prisma.courier.update({
        where: { id },
        data: { isOnline: dto.isOnline },
      });
      if (wasOnline && !dto.isOnline) {
        const profile = await this.prisma.courier.findFirst({
          where: { id },
          include: { user: { select: { fullName: true } } },
        });
        const notification = await this.adminNotifications.notifyCourierOffline({
          id,
          name: profile?.user?.fullName ?? 'Courier',
        });
        this.gateway.emitAdminEvent('notification', notification);
      }
    }

    await this.audit.log({
      userId,
      action: dto.isActive === false ? 'block' : dto.isOnline === false ? 'offline' : 'status_update',
      entity: 'courier',
      entityId: id,
      metadata: dto,
    });

    return this.findById(id);
  }

  async getHistory(id: string) {
    const courier = await this.prisma.courier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!courier) throw new NotFoundException('Courier not found');

    const orders = await this.prisma.order.findMany({
      where: { courierId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        restaurant: { select: { name: true } },
        guestOrder: true,
        assignment: true,
      },
    });

    return orders.map((o) => ({
      ...o,
      total: Number(o.total),
      deliveryFee: Number(o.deliveryFee),
    }));
  }

  async getStats(courierId: string) {
    const base: Prisma.OrderWhereInput = { courierId, deletedAt: null };

    const [completedOrders, cancelledOrders, activeOrders, revenueAgg, deliveryTimes] =
      await Promise.all([
        this.prisma.order.count({
          where: { ...base, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({
          where: { ...base, status: OrderStatus.CANCELLED },
        }),
        this.prisma.order.count({
          where: { ...base, status: { in: ACTIVE_STATUSES } },
        }),
        this.prisma.order.aggregate({
          where: { ...base, status: OrderStatus.DELIVERED },
          _sum: { total: true },
        }),
        this.prisma.courierAssignment.findMany({
          where: {
            courierId,
            deliveredAt: { not: null },
            acceptedAt: { not: null },
          },
          select: { acceptedAt: true, deliveredAt: true },
          take: 100,
          orderBy: { deliveredAt: 'desc' },
        }),
      ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    let averageDeliveryTime = 0;
    if (deliveryTimes.length) {
      const totalMinutes = deliveryTimes.reduce((sum, a) => {
        const mins =
          (a.deliveredAt!.getTime() - a.acceptedAt!.getTime()) / (1000 * 60);
        return sum + mins;
      }, 0);
      averageDeliveryTime = Math.round(totalMinutes / deliveryTimes.length);
    }

    return {
      completedOrders,
      cancelledOrders,
      activeOrders,
      totalRevenue,
      averageDeliveryTime,
    };
  }

  private async buildStatsMap(courierIds: string[]) {
    const map = new Map<string, Awaited<ReturnType<CouriersService['getStats']>>>();
    await Promise.all(
      courierIds.map(async (id) => {
        map.set(id, await this.getStats(id));
      }),
    );
    return map;
  }

  async getProfile(userId: string) {
    const courier = await this.prisma.courier.findFirst({
      where: { userId },
      include: {
        user: { select: { fullName: true, phone: true } },
        assignments: {
          take: 20,
          orderBy: { assignedAt: 'desc' },
          include: { order: { select: { orderNumber: true, status: true, total: true } } },
        },
      },
    });
    return courier;
  }

  async setOnline(userId: string, isOnline: boolean) {
    return this.prisma.courier.updateMany({
      where: { userId },
      data: { isOnline },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.courier.updateMany({
      where: { userId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async getAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PREPARING, OrderStatus.COURIER_ASSIGNED] },
        courierId: null,
        deletedAt: null,
      },
      include: {
        guestOrder: true,
        restaurant: { select: { name: true } },
        branch: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  async getEarnings(userId: string) {
    const courier = await this.prisma.courier.findFirst({ where: { userId } });
    if (!courier) return null;

    const assignments = await this.prisma.courierAssignment.aggregate({
      where: { courierId: courier.id },
      _sum: { courierFee: true },
      _count: true,
    });

    return {
      totalEarnings: Number(courier.totalEarnings),
      assignmentEarnings: Number(assignments._sum.courierFee ?? 0),
      totalDeliveries: courier.totalDeliveries,
      completedAssignments: assignments._count,
    };
  }
}
