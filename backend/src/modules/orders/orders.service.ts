import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { OrdersGateway } from './orders.gateway';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  generateOrderNumber,
  generateTrackingToken,
} from '../../common/utils/order-number.util';
import { distanceKm, calculateDeliveryFee } from '../../common/utils/geo.util';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.COURIER_ASSIGNED, OrderStatus.CANCELLED],
  COURIER_ASSIGNED: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  PICKED_UP: [OrderStatus.DELIVERING],
  DELIVERING: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
    private gateway: OrdersGateway,
  ) {}

  async createGuestOrder(dto: CreateGuestOrderDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: dto.restaurantId, isActive: true, deletedAt: null },
      include: { branches: { where: { isActive: true }, take: 1 } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        restaurantId: dto.restaurantId,
        isAvailable: true,
        deletedAt: null,
      },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products are unavailable');
    }

    const branch = dto.branchId
      ? await this.prisma.restaurantBranch.findFirst({
          where: { id: dto.branchId, restaurantId: dto.restaurantId },
        })
      : restaurant.branches[0];
    if (!branch) throw new BadRequestException('No active branch');

    const branchLat = Number(branch.latitude);
    const branchLng = Number(branch.longitude);
    const dist = distanceKm(branchLat, branchLng, dto.latitude, dto.longitude);

    const deliveryConfig = await this.settings.getDeliveryPricing();
    const deliveryFee = calculateDeliveryFee(
      dist,
      deliveryConfig.pricePerKm,
      deliveryConfig.minDeliveryFee,
      deliveryConfig.baseFee,
    );

    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const price = Number(product.price);
      const lineSubtotal = price * item.quantity;
      subtotal += lineSubtotal;
      orderItems.push({
        product: { connect: { id: product.id } },
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: lineSubtotal,
      });
    }

    const commissionRate = Number(restaurant.commissionRate) / 100;
    const commissionAmount = subtotal * commissionRate;
    const total = subtotal + deliveryFee;

    const guestOrder = await this.prisma.guestOrder.create({
      data: {
        phone: dto.phone,
        deliveryAddress: dto.deliveryAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,
        comment: dto.comment,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        trackingToken: generateTrackingToken(),
        restaurantId: dto.restaurantId,
        branchId: branch.id,
        guestOrderId: guestOrder.id,
        subtotal,
        deliveryFee,
        commissionAmount,
        total,
        distanceKm: dist,
        items: { create: orderItems },
        payment: {
          create: { amount: total, method: 'CASH', status: 'PENDING' },
        },
        address: {
          create: {
            line1: dto.deliveryAddress,
            latitude: dto.latitude,
            longitude: dto.longitude,
            notes: dto.comment,
          },
        },
      },
      include: {
        items: true,
        guestOrder: true,
        restaurant: { select: { id: true, name: true, slug: true } },
      },
    });

    const payload = this.serializeOrder(order);
    this.gateway.emitRestaurantOrder(order.restaurantId, payload);
    this.gateway.emitOrderUpdate(order.trackingToken, payload);

    return {
      order: payload,
      trackingUrl: `/track/${order.trackingToken}`,
    };
  }

  async findByTrackingToken(token: string) {
    const order = await this.prisma.order.findFirst({
      where: { trackingToken: token, deletedAt: null },
      include: {
        items: true,
        guestOrder: true,
        restaurant: { select: { name: true, phone: true } },
        courier: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.serializeOrder(order);
  }

  async findAll(query: PaginationDto, user: JwtPayload, filters?: { status?: OrderStatus; restaurantId?: string }) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.OrderWhereInput = { deletedAt: null };

    if (user.role === UserRole.RESTAURANT_OWNER || user.role === UserRole.RESTAURANT_STAFF) {
      if (!user.restaurantId) throw new ForbiddenException();
      where.restaurantId = user.restaurantId;
    } else if (filters?.restaurantId) {
      where.restaurantId = filters.restaurantId;
    }

    if (user.role === UserRole.COURIER) {
      const courier = await this.prisma.courier.findFirst({ where: { userId: user.sub } });
      if (courier) where.courierId = courier.id;
    }

    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          guestOrder: true,
          restaurant: { select: { name: true } },
          courier: { include: { user: { select: { fullName: true } } } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginatedResponse(
      data.map((o) => this.serializeOrder(o)),
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto, user: JwtPayload) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new NotFoundException('Order not found');

    this.assertCanUpdateOrder(order, user);
    const allowed = STATUS_FLOW[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    const updateData: Prisma.OrderUpdateInput = { status: dto.status };

    if (dto.status === OrderStatus.ACCEPTED) {
      updateData.acceptedAt = new Date();
    }
    if (dto.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }
    if (dto.status === OrderStatus.CANCELLED) {
      updateData.cancelReason = dto.cancelReason;
    }

    if (dto.status === OrderStatus.COURIER_ASSIGNED && dto.courierId) {
      await this.assignCourier(order.id, dto.courierId, user.sub);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        guestOrder: true,
        restaurant: { select: { name: true } },
        courier: { include: { user: { select: { fullName: true } } } },
      },
    });

    const payload = this.serializeOrder(updated);
    this.gateway.emitOrderUpdate(updated.trackingToken, payload);
    this.gateway.emitRestaurantOrder(updated.restaurantId, payload);

    return payload;
  }

  async assignCourier(orderId: string, courierId: string, assignedBy?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { branch: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const courier = await this.prisma.courier.findFirst({
      where: { id: courierId, deletedAt: null, isOnline: true },
    });
    if (!courier) throw new BadRequestException('Courier not available');

    const deliveryConfig = await this.settings.getDeliveryPricing();
    const dist = Number(order.distanceKm ?? 0);
    const courierFee = calculateDeliveryFee(
      dist,
      deliveryConfig.courierPricePerKm,
      deliveryConfig.courierMinFee,
    );

    await this.prisma.$transaction([
      this.prisma.courierAssignment.upsert({
        where: { orderId },
        create: {
          orderId,
          courierId,
          assignedBy,
          courierFee,
          distanceKm: dist,
        },
        update: { courierId, assignedBy, courierFee },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          courierId,
          status: OrderStatus.COURIER_ASSIGNED,
        },
      }),
    ]);

    this.gateway.emitCourierAssignment(courierId, { orderId, courierFee });

    const updated = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, guestOrder: true },
    });
    return this.serializeOrder(updated!);
  }

  async acceptOrderAsCourier(orderId: string, userId: string) {
    const courier = await this.prisma.courier.findFirst({ where: { userId } });
    if (!courier) throw new ForbiddenException();

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        status: { in: [OrderStatus.PREPARING, OrderStatus.COURIER_ASSIGNED] },
        OR: [{ courierId: null }, { courierId: courier.id }],
      },
    });
    if (!order) throw new NotFoundException('Order not available');

    return this.assignCourier(orderId, courier.id, userId);
  }

  private assertCanUpdateOrder(
    order: { restaurantId: string; courierId: string | null },
    user: JwtPayload,
  ) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (
      (user.role === UserRole.RESTAURANT_OWNER || user.role === UserRole.RESTAURANT_STAFF) &&
      user.restaurantId === order.restaurantId
    ) {
      return;
    }
    if (user.role === UserRole.COURIER) return;
    throw new ForbiddenException('Insufficient permissions');
  }

  private serializeOrder(order: Record<string, unknown>) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      distanceKm: order.distanceKm ? Number(order.distanceKm) : null,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      items: order.items,
      guestOrder: order.guestOrder,
      restaurant: order.restaurant,
      courier: order.courier,
    };
  }
}
