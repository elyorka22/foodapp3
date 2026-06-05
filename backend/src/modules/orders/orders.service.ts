import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus, Prisma, BusinessApprovalStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { OrdersGateway } from './orders.gateway';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { LoyaltyService } from '../growth/loyalty.service';
import { RestaurantScheduleService } from '../restaurants/restaurant-schedule.service';
import { userBusinessId } from '../../domain/business/business-id.util';
import { orderWhereForVertical } from '../../domain/business/merchant-vertical';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import {
  generateOrderNumber,
  generateTrackingToken,
} from '../../common/utils/order-number.util';
import { calculateDeliveryFee } from '../../common/utils/geo.util';
import { DeliveryPricingService } from '../../domain/delivery/delivery-pricing.service';
import { DeliveryQuoteDto } from './dto/delivery-quote.dto';
import { normalizePhone } from '../../common/utils/phone.util';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CustomersService } from '../customers/customers.service';
import { NotificationService } from '../notifications/notifications.service';
import { ORDER_STATUS_TO_CUSTOMER_TEMPLATE } from '../notifications/constants/order-status-notification.map';

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
    private adminNotifications: AdminNotificationsService,
    private promoCodes: PromoCodesService,
    private loyalty: LoyaltyService,
    private schedule: RestaurantScheduleService,
    private customers: CustomersService,
    private notifications: NotificationService,
    private deliveryPricing: DeliveryPricingService,
  ) {}

  async quoteDelivery(dto: DeliveryQuoteDto) {
    const branch = await this.resolveBranch(dto.restaurantId, dto.branchId);
    return this.deliveryPricing.quote({
      restaurant: {
        latitude: Number(branch.latitude),
        longitude: Number(branch.longitude),
      },
      customer: { latitude: dto.latitude, longitude: dto.longitude },
    });
  }

  private async resolveBranch(restaurantId: string, branchId?: string) {
    const branch = branchId
      ? await this.prisma.businessBranch.findFirst({
          where: { id: branchId, businessId: restaurantId, isActive: true, deletedAt: null },
        })
      : await this.prisma.businessBranch.findFirst({
          where: { businessId: restaurantId, isActive: true, deletedAt: null },
          orderBy: { createdAt: 'asc' },
        });
    if (!branch) {
      throw new BadRequestException(
        'Restaurant location is not configured. Admin must set coordinates.',
      );
    }
    return branch;
  }

  async createGuestOrder(dto: CreateGuestOrderDto) {
    const restaurant = await this.prisma.business.findFirst({
      where: {
        id: dto.restaurantId,
        isActive: true,
        deletedAt: null,
        approvalStatus: BusinessApprovalStatus.APPROVED,
      },
      include: { branches: { where: { isActive: true }, take: 1 } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found or not approved');

    const isOpen = await this.schedule.isOpen(dto.restaurantId);
    if (!isOpen) {
      throw new BadRequestException('Restaurant is currently closed');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: dto.restaurantId,
        isAvailable: true,
        deletedAt: null,
      },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products are unavailable');
    }

    const branch = await this.resolveBranch(dto.restaurantId, dto.branchId);

    const quote = await this.deliveryPricing.quote({
      restaurant: {
        latitude: Number(branch.latitude),
        longitude: Number(branch.longitude),
      },
      customer: { latitude: dto.latitude, longitude: dto.longitude },
    });
    const dist = quote.distanceKm;
    const deliveryFee = quote.deliveryFee;
    const restaurantLat = quote.restaurantLatitude;
    const restaurantLng = quote.restaurantLongitude;
    const customerLat = quote.customerLatitude;
    const customerLng = quote.customerLongitude;

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
        description: product.description ?? null,
        price: product.price,
        quantity: item.quantity,
        subtotal: lineSubtotal,
      });
    }

    const phone = normalizePhone(dto.phone);
    let customerId: string | undefined;
    const linkedCustomer = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
    if (linkedCustomer) {
      customerId = linkedCustomer.id;
    }
    if (dto.customerId) {
      if (dto.customerId !== customerId) {
        throw new BadRequestException('Customer id does not match phone number');
      }
      await this.customers.assertCustomerCanOrder(dto.customerId);
    }

    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const order = await this.prisma.$transaction(async (tx) => {
      let discountAmount = 0;
      let promoCodeId: string | undefined;

      const guestOrder = await tx.guestOrder.create({
        data: {
          phone,
          customerId,
          deliveryAddress: dto.deliveryAddress,
          latitude: dto.latitude,
          longitude: dto.longitude,
          comment: dto.comment,
        },
      });

      const created = await tx.order.create({
        data: {
          orderNumber,
          trackingToken,
          businessId: dto.restaurantId,
          branchId: branch.id,
          guestOrderId: guestOrder.id,
          subtotal,
          deliveryFee,
          discountAmount: 0,
          commissionAmount: 0,
          total: subtotal + deliveryFee,
          distanceKm: dist,
          restaurantLatitude: restaurantLat,
          restaurantLongitude: restaurantLng,
          customerLatitude: customerLat,
          customerLongitude: customerLng,
          items: { create: orderItems },
          payment: {
            create: { amount: subtotal + deliveryFee, method: 'CASH', status: 'PENDING' },
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
      });

      if (dto.promoCode?.trim()) {
        const promo = await this.promoCodes.applyInTransaction(
          tx,
          dto.promoCode,
          subtotal,
          created.id,
          customerId,
        );
        discountAmount = promo.discountAmount;
        promoCodeId = promo.promoCodeId;
      }

      const netSubtotal = subtotal - discountAmount;
      const commissionRate = Number(restaurant.commissionRate) / 100;
      const commissionAmount = netSubtotal * commissionRate;
      const total = netSubtotal + deliveryFee;

      return tx.order.update({
        where: { id: created.id },
        data: {
          discountAmount,
          promoCodeId,
          commissionAmount,
          total,
          payment: { update: { amount: total } },
        },
        include: {
          items: true,
          guestOrder: true,
          business: { select: { id: true, name: true, slug: true } },
        },
      });
    });

    await this.recordStatusChange(order.id, OrderStatus.PENDING, undefined, 'Order placed');

    const payload = this.serializeOrder(order);
    this.gateway.emitBusinessOrder(order.businessId, payload);
    this.gateway.emitOrderUpdate(order.trackingToken, payload);

    const notification = await this.adminNotifications.notifyNewOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      restaurant: order.business,
    });
    this.gateway.emitAdminEvent('notification', notification);

    await this.notifications.notifyManagersNewOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      businessName: order.business?.name,
    });

    if (customerId) {
      await this.notifications.notifyCustomerOrderStatus({
        customerId,
        templateCode: 'ORDER_CREATED',
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
        },
      });
    }

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
        business: { select: { name: true, phone: true } },
        courier: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.serializeOrder(order);
  }

  async findOneById(id: string, user: JwtPayload) {
    const where: Prisma.OrderWhereInput = { id, deletedAt: null };

    if (user.role === UserRole.BUSINESS) {
      if (!userBusinessId(user)) throw new ForbiddenException();
      where.businessId = user.businessId;
    }

    if (user.role === UserRole.COURIER) {
      const courier = await this.prisma.courier.findFirst({ where: { userId: user.sub } });
      if (courier) where.courierId = courier.id;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: true,
        guestOrder: { include: { customer: true } },
        business: { select: { id: true, name: true } },
        branch: true,
        courier: { include: { user: { select: { fullName: true, phone: true } } } },
        assignment: true,
        address: true,
        payment: true,
        transactions: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.serializeOrder(order);
  }

  async findAll(query: OrdersQueryDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.OrderWhereInput = { deletedAt: null };

    if (user.role === UserRole.BUSINESS) {
      if (!userBusinessId(user)) throw new ForbiddenException();
      where.businessId = userBusinessId(user)!;
    } else if (query.restaurantId || query.businessId) {
      where.businessId = query.businessId ?? query.restaurantId;
    }

    if (user.role === UserRole.COURIER) {
      const courier = await this.prisma.courier.findFirst({ where: { userId: user.sub } });
      if (courier) where.courierId = courier.id;
    }

    if (query.statusGroup === 'active') {
      where.status = {
        in: [
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
          OrderStatus.COURIER_ASSIGNED,
          OrderStatus.PICKED_UP,
          OrderStatus.DELIVERING,
        ],
      };
    } else if (query.statusGroup === 'cancelled') {
      where.status = OrderStatus.CANCELLED;
    } else if (query.status) {
      where.status = query.status;
    }

    const and: Prisma.OrderWhereInput[] = [];
    if (query.dateFrom) and.push({ createdAt: { gte: new Date(query.dateFrom) } });
    if (query.dateTo) and.push({ createdAt: { lte: new Date(query.dateTo) } });
    const verticalFilter = orderWhereForVertical(query.vertical);
    if (verticalFilter) and.push(verticalFilter);
    if (and.length) where.AND = and;

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { guestOrder: { phone: { contains: q, mode: 'insensitive' } } },
        { business: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          guestOrder: { include: { customer: true } },
          business: { select: { name: true } },
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

    await this.assertCanUpdateOrder(order, user);
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
      await this.assignCourier(order.id, dto.courierId, user.sub, dto.cancelReason);
      const refreshed = await this.prisma.order.findFirst({
        where: { id: orderId },
        include: {
          items: true,
          guestOrder: true,
          business: { select: { name: true } },
          courier: { include: { user: { select: { fullName: true } } } },
        },
      });
      const payload = this.serializeOrder(refreshed!);
      this.gateway.emitOrderUpdate(refreshed!.trackingToken, payload);
      this.gateway.emitAdminOrderUpdate(payload);
      return payload;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        guestOrder: true,
        business: { select: { name: true } },
        courier: { include: { user: { select: { fullName: true } } } },
      },
    });

    await this.recordStatusChange(
      orderId,
      dto.status,
      user.sub,
      dto.cancelReason ?? undefined,
    );

    if (dto.status === OrderStatus.DELIVERED) {
      await this.loyalty.onOrderDelivered(orderId);
    }

    const payload = this.serializeOrder(updated);
    this.gateway.emitOrderUpdate(updated.trackingToken, payload);
    this.gateway.emitBusinessOrder(updated.businessId, payload);
    this.gateway.emitAdminOrderUpdate(payload);

    await this.emitOrderStatusNotifications(updated, dto.status);

    return payload;
  }

  private async emitOrderStatusNotifications(
    order: {
      id: string;
      orderNumber: string;
      trackingToken?: string;
      status: OrderStatus;
      guestOrder?: { customerId: string | null } | null;
      courier?: { userId: string } | { user?: { id: string } } | null;
      business?: { name: string | null } | null;
    },
    status: OrderStatus,
  ) {
    const templateCode = ORDER_STATUS_TO_CUSTOMER_TEMPLATE[status];
    const customerId = order.guestOrder?.customerId;
    if (customerId && templateCode) {
      await this.notifications.notifyCustomerOrderStatus({
        customerId,
        templateCode,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingToken: order.trackingToken,
          status,
          businessName: order.business?.name,
        },
      });
    }

    const courierUserId =
      order.courier && 'userId' in order.courier
        ? order.courier.userId
        : order.courier?.user?.id;
    if (status === OrderStatus.COURIER_ASSIGNED && courierUserId) {
      await this.notifications.notifyCourierAssigned({
        courierUserId,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }
  }

  async getStatusHistory(orderId: string, user: JwtPayload) {
    await this.findOneById(orderId, user);
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: {
        changedBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  }

  async assignCourier(orderId: string, courierId: string, assignedBy?: string, note?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { branch: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.courierId && order.courierId !== courierId) {
      throw new BadRequestException('Order already assigned to another courier');
    }

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

    await this.recordStatusChange(
      orderId,
      OrderStatus.COURIER_ASSIGNED,
      assignedBy,
      note ?? 'Courier assigned',
    );

    this.gateway.emitCourierAssignment(courierId, { orderId, courierFee });

    const updated = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        guestOrder: true,
        business: { select: { name: true } },
        courier: { select: { userId: true } },
      },
    });
    const payload = this.serializeOrder(updated!);
    this.gateway.emitOrderUpdate(updated!.trackingToken, payload);
    this.gateway.emitAdminOrderUpdate(payload);
    await this.emitOrderStatusNotifications(updated!, OrderStatus.COURIER_ASSIGNED);
    return payload;
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

  private async assertCanUpdateOrder(
    order: { id: string; businessId: string; courierId: string | null },
    user: JwtPayload,
  ) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (
      user.role === UserRole.BUSINESS &&
      userBusinessId(user) === order.businessId
    ) {
      return;
    }
    if (user.role === UserRole.COURIER) {
      const courier = await this.prisma.courier.findFirst({ where: { userId: user.sub } });
      if (!courier || order.courierId !== courier.id) {
        throw new ForbiddenException('Courier can only update assigned orders');
      }
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }

  private recordStatusChange(
    orderId: string,
    status: OrderStatus,
    changedByUserId?: string,
    note?: string,
  ) {
    return this.prisma.orderStatusHistory.create({
      data: { orderId, status, changedByUserId, note },
    });
  }

  private serializeGuestOrder(guestOrder: Record<string, unknown> | null | undefined) {
    if (!guestOrder) return guestOrder;
    return {
      ...guestOrder,
      latitude: Number(guestOrder.latitude),
      longitude: Number(guestOrder.longitude),
    };
  }

  private serializeAddress(address: Record<string, unknown> | null | undefined) {
    if (!address) return address;
    return {
      ...address,
      latitude: Number(address.latitude),
      longitude: Number(address.longitude),
    };
  }

  private serializeOrder(order: Record<string, unknown>) {
    const guestOrder = order.guestOrder as Record<string, unknown> | undefined;
    const address = order.address as Record<string, unknown> | undefined;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number((order as { discountAmount?: unknown }).discountAmount ?? 0),
      total: Number(order.total),
      distanceKm: order.distanceKm ? Number(order.distanceKm) : null,
      restaurantLatitude: order.restaurantLatitude
        ? Number(order.restaurantLatitude)
        : null,
      restaurantLongitude: order.restaurantLongitude
        ? Number(order.restaurantLongitude)
        : null,
      customerLatitude: order.customerLatitude
        ? Number(order.customerLatitude)
        : null,
      customerLongitude: order.customerLongitude
        ? Number(order.customerLongitude)
        : null,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      items: Array.isArray(order.items)
        ? (order.items as Record<string, unknown>[]).map((item) => ({
            ...item,
            price: Number(item.price),
            subtotal: Number(item.subtotal),
          }))
        : order.items,
      guestOrder: this.serializeGuestOrder(guestOrder),
      restaurant: order.business,
      courier: order.courier,
      assignment: order.assignment,
      address: this.serializeAddress(address),
      payment: order.payment,
      transactions: order.transactions,
    };
  }
}
