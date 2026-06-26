import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantScheduleService } from './restaurant-schedule.service';
import {
  BusinessKind,
  OrderStatus,
  Prisma,
  BusinessApprovalStatus,
  UserRole,
} from '@prisma/client';
import { isRestaurantKind, resolveBusinessKind } from '../../common/utils/business-kind.util';
import {
  buildMenuCategoriesFromProducts,
  sortMenuProducts,
} from '../../common/utils/menu-order.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { normalizePhone } from '../../common/utils/phone.util';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { SetupOwnerAccountDto } from './dto/setup-owner-account.dto';
import { AdminRestaurantsQueryDto } from './dto/admin-restaurants-query.dto';
import { userBusinessId } from '../../domain/business/business-id.util';
import { businessWhereForVertical } from '../../domain/business/merchant-vertical';
import { resolveSlugForCreate, resolveSlugForUpdate } from '../../common/utils/slug.util';
import { SettingsService } from '../settings/settings.service';
import {
  resolveRestaurantCoverFraming,
  type ImageFramingDefaults,
} from '../../common/utils/image-framing.util';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private adminNotifications: AdminNotificationsService,
    private schedule: RestaurantScheduleService,
    private settings: SettingsService,
    private auth: AuthService,
  ) {}

  /** Homepage / food delivery — restaurants only, not marketplace shops (grocery, pharmacy, …). */
  async findAllPublic(query: { page?: number; limit?: number; search?: string }) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.BusinessWhereInput = {
      isActive: true,
      approvalStatus: BusinessApprovalStatus.APPROVED,
      deletedAt: null,
      AND: [
        {
          OR: [
            { businessTypeId: null },
            { businessType: { slug: 'restaurant', isActive: true } },
          ],
        },
        ...(query.search
          ? [
              {
                OR: [
                  { name: { contains: query.search, mode: 'insensitive' as const } },
                  { description: { contains: query.search, mode: 'insensitive' as const } },
                ],
              },
            ]
          : []),
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          branches: { where: { isActive: true }, take: 1 },
          productCategories: {
            where: { isActive: true, deletedAt: null },
            select: { id: true, name: true, slug: true },
            orderBy: { sortOrder: 'asc' },
            take: 6,
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    const framingDefaults = await this.settings.getImageFramingDefaults();
    const availabilityMap = await this.schedule.getAvailabilityBatch(data.map((r) => r.id));
    const serialized = data.map((r) => ({
      ...this.serializePublicListItem(r, framingDefaults),
      ...availabilityMap.get(r.id),
    }));
    return paginatedResponse(serialized, total, query.page ?? 1, query.limit ?? 20);
  }

  private serializePublicListItem(
    r: {
    id: string;
    name: string;
    slug: string;
    kind?: BusinessKind;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    coverPositionX: number;
    coverPositionY: number;
    coverScale?: number;
    phone: string | null;
    commissionRate: Prisma.Decimal;
    minOrderAmount: Prisma.Decimal | null;
    avgPrepMinutes: number;
    averageRating: Prisma.Decimal | null;
    reviewCount: number;
    branches?: { address: string }[];
    productCategories?: { id: string; name: string; slug: string }[];
  },
    framingDefaults: ImageFramingDefaults,
  ) {
    const branch = r.branches?.[0];
    const cover = resolveRestaurantCoverFraming(r, framingDefaults);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      kind: resolveBusinessKind(r),
      description: r.description,
      logoUrl: r.logoUrl,
      coverUrl: r.coverUrl,
      coverPositionX: cover.coverPositionX,
      coverPositionY: cover.coverPositionY,
      coverScale: cover.coverScale,
      phone: r.phone,
      commissionRate: Number(r.commissionRate),
      minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : null,
      avgPrepMinutes: r.avgPrepMinutes,
      deliveryMinutes: r.avgPrepMinutes,
      averageRating: r.averageRating ? Number(r.averageRating) : null,
      reviewCount: r.reviewCount,
      address: branch?.address ?? null,
      productCategories: r.productCategories ?? [],
    };
  }

  async findAllPublicAsBusinesses(query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    excludeType?: string;
    sort?: 'popular' | 'nearest' | 'rating' | 'fastest';
  }) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.BusinessWhereInput = {
      isActive: true,
      approvalStatus: BusinessApprovalStatus.APPROVED,
      deletedAt: null,
    };

    if (query.type) {
      where.businessType = { slug: query.type, isActive: true };
    } else if (query.excludeType) {
      where.NOT = { businessType: { slug: query.excludeType } };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          products: {
            some: {
              deletedAt: null,
              isAvailable: true,
              name: { contains: q, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.BusinessOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (query.sort === 'fastest') {
      orderBy = { avgPrepMinutes: 'asc' };
    } else if (query.sort === 'popular') {
      orderBy = { reviewCount: 'desc' };
    }

    const [rows, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          businessType: true,
          branches: { where: { isActive: true }, take: 1 },
          productCategories: {
            where: { isActive: true, deletedAt: null },
            select: { id: true, name: true, slug: true },
            orderBy: { sortOrder: 'asc' },
            take: 6,
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    const data = rows.map((r) => this.serializeBusiness(r));
    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  private serializeBusiness(r: {
    id: string;
    name: string;
    slug: string;
    kind?: BusinessKind;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    phone?: string | null;
    commissionRate: Prisma.Decimal;
    minOrderAmount: Prisma.Decimal | null;
    avgPrepMinutes: number;
    averageRating: Prisma.Decimal | null;
    reviewCount: number;
    businessType?: { id: string; name: string; slug: string; icon: string | null } | null;
    branches?: { address?: string; latitude: Prisma.Decimal; longitude: Prisma.Decimal }[];
    productCategories?: { id: string; name: string; slug: string }[];
  }) {
    const branch = r.branches?.[0];
    const kind = resolveBusinessKind(r);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      kind,
      description: r.description,
      logoUrl: r.logoUrl,
      coverUrl: r.coverUrl,
      phone: r.phone,
      commissionRate: Number(r.commissionRate),
      minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : null,
      deliveryMinutes: r.avgPrepMinutes,
      averageRating: r.averageRating ? Number(r.averageRating) : 4.5,
      reviewCount: r.reviewCount,
      businessType: r.businessType,
      category: r.businessType?.name ?? null,
      latitude: branch ? Number(branch.latitude) : null,
      longitude: branch ? Number(branch.longitude) : null,
      address: branch?.address ?? null,
      productCategories: isRestaurantKind(r) ? [] : (r.productCategories ?? []),
    };
  }

  async findBySlug(slug: string) {
    const restaurant = await this.prisma.business.findFirst({
      where: {
        slug,
        isActive: true,
        approvalStatus: BusinessApprovalStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        businessType: true,
        branches: { where: { isActive: true } },
        productCategories: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isAvailable: true, deletedAt: null },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            dishCategory: true,
            productCategory: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const availability = await this.schedule.getAvailability(restaurant.id);
    const kind = resolveBusinessKind(restaurant);
    const branch = restaurant.branches?.[0];
    const restaurantMenu = isRestaurantKind(restaurant);
    const products = sortMenuProducts(
      restaurant.products.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      })),
      restaurantMenu,
    );

    const menuCategories = buildMenuCategoriesFromProducts(products, restaurantMenu);

    return {
      ...restaurant,
      kind,
      products,
      isOpen: availability.isOpen,
      closesAt: availability.closesAt,
      closingSoon: availability.closingSoon,
      minutesUntilClose: availability.minutesUntilClose,
      catalogMode: 'CATALOG',
      phone: restaurant.phone,
      logoUrl: restaurant.logoUrl,
      description: restaurant.description,
      commissionRate: Number(restaurant.commissionRate),
      minOrderAmount: restaurant.minOrderAmount
        ? Number(restaurant.minOrderAmount)
        : null,
      averageRating: restaurant.averageRating
        ? Number(restaurant.averageRating)
        : null,
      deliveryMinutes: restaurant.avgPrepMinutes,
      address: branch?.address ?? null,
      productCategories: restaurantMenu
        ? menuCategories
        : restaurant.productCategories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            sortOrder: c.sortOrder,
          })),
    };
  }

  async findById(id: string, user?: JwtPayload) {
    const restaurant = await this.prisma.business.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(!user && {
          isActive: true,
          approvalStatus: BusinessApprovalStatus.APPROVED,
        }),
      },
      include: {
        branches: { where: { deletedAt: null, ...(!user && { isActive: true }) } },
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (user) this.assertRestaurantAccess(id, user);

    const branch = restaurant.branches?.[0];
    let ownerLogin: string | null = null;
    let ownerFullName: string | null = null;
    let ownerPassword: string | null = null;
    if (user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER)) {
      const staff = await this.prisma.businessStaff.findFirst({
        where: { businessId: id, deletedAt: null },
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              fullName: true,
              ...(user.role === UserRole.SUPER_ADMIN ? { adminPasswordNote: true } : {}),
            },
          },
        },
      });
      ownerLogin = staff?.user?.email ?? staff?.user?.phone ?? null;
      ownerFullName = staff?.user?.fullName ?? null;
      if (user.role === UserRole.SUPER_ADMIN) {
        ownerPassword = staff?.user?.adminPasswordNote ?? null;
      }
    }

    return {
      ...restaurant,
      commissionRate: Number(restaurant.commissionRate),
      branchAddress: branch?.address ?? null,
      latitude: branch ? Number(branch.latitude) : null,
      longitude: branch ? Number(branch.longitude) : null,
      ownerLogin,
      ownerFullName,
      ownerPassword,
    };
  }

  async findAllAdmin(query: AdminRestaurantsQueryDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const verticalFilter = businessWhereForVertical(query.vertical);
    const where: Prisma.BusinessWhereInput = {
      deletedAt: null,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(verticalFilter ?? {}),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    if (user.role === UserRole.BUSINESS) {
      if (!user.businessId) throw new ForbiddenException();
      where.id = userBusinessId(user)!;
    }

    const [rows, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          businessType: true,
          branches: {
            where: { deletedAt: null, isActive: true },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    const ids = rows.map((r) => r.id);
    if (!ids.length) {
      return paginatedResponse([], total, query.page ?? 1, query.limit ?? 20);
    }

    const [orderGroups, revenueGroups, productGroups] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['businessId'],
        where: { businessId: { in: ids }, deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ['businessId'],
        where: {
          businessId: { in: ids },
          deletedAt: null,
          status: OrderStatus.DELIVERED,
        },
        _sum: { total: true },
      }),
      this.prisma.product.groupBy({
        by: ['businessId'],
        where: { businessId: { in: ids }, deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const orderCountMap = new Map(orderGroups.map((g) => [g.businessId, g._count._all]));
    const revenueMap = new Map(
      revenueGroups.map((g) => [g.businessId, Number(g._sum.total ?? 0)]),
    );
    const productCountMap = new Map(productGroups.map((g) => [g.businessId, g._count._all]));

    const ownerMap = await this.loadOwnerCredentialsByBusinessIds(ids, user);

    const data = rows.map((r) => {
      const branch = r.branches?.[0];
      const owner = ownerMap.get(r.id);
      return {
        ...r,
        commissionRate: Number(r.commissionRate),
        ordersCount: orderCountMap.get(r.id) ?? 0,
        revenue: revenueMap.get(r.id) ?? 0,
        productsCount: productCountMap.get(r.id) ?? 0,
        latitude: branch ? Number(branch.latitude) : null,
        longitude: branch ? Number(branch.longitude) : null,
        branchAddress: branch?.address ?? null,
        ownerLogin: owner?.ownerLogin ?? null,
        ownerFullName: owner?.ownerFullName ?? null,
        ownerPassword: owner?.ownerPassword ?? null,
      };
    });

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async getStats(id: string, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const restaurant = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const baseWhere: Prisma.OrderWhereInput = { businessId: id, deletedAt: null };

    const [totalOrders, completedOrders, cancelledOrders, revenueAgg, productsCount, latestOrders] =
      await Promise.all([
        this.prisma.order.count({ where: baseWhere }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.CANCELLED },
        }),
        this.prisma.order.aggregate({
          where: { ...baseWhere, status: OrderStatus.DELIVERED },
          _sum: { total: true },
        }),
        this.prisma.product.count({ where: { businessId: id, deletedAt: null } }),
        this.prisma.order.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { guestOrder: true },
        }),
      ]);

    const revenue = Number(revenueAgg._sum.total ?? 0);
    const averageOrderValue = completedOrders > 0 ? revenue / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenue,
      averageOrderValue,
      productsCount,
      latestOrders,
    };
  }

  private async isBusinessSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.prisma.business.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!row;
  }

  async create(dto: CreateRestaurantDto, user?: JwtPayload) {
    const isAdmin =
      user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
    const wantsActive = dto.isActive !== false;
    const publishOnSite = isAdmin && wantsActive;

    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (s) => this.isBusinessSlugTaken(s),
    });

    if (dto.ownerLogin && !dto.ownerPassword) {
      throw new BadRequestException('ownerPassword is required when ownerLogin is set');
    }
    if (dto.ownerPassword && !dto.ownerLogin) {
      throw new BadRequestException('ownerLogin is required when ownerPassword is set');
    }

    let kind: BusinessKind =
      dto.kind === 'STORE'
        ? BusinessKind.STORE
        : dto.kind === 'RESTAURANT'
          ? BusinessKind.RESTAURANT
          : BusinessKind.RESTAURANT;
    let businessTypeId = dto.businessTypeId;
    if (dto.businessTypeId) {
      const type = await this.prisma.businessType.findUnique({
        where: { id: dto.businessTypeId },
      });
      if (!type) throw new NotFoundException('Business type not found');
      kind = type.slug === 'restaurant' ? BusinessKind.RESTAURANT : BusinessKind.STORE;
    } else if (kind === BusinessKind.STORE) {
      const storeType = await this.prisma.businessType.findFirst({
        where: { isActive: true, slug: { not: 'restaurant' } },
        orderBy: { sortOrder: 'asc' },
      });
      businessTypeId = storeType?.id;
    } else {
      const restaurantType = await this.prisma.businessType.findUnique({
        where: { slug: 'restaurant' },
      });
      businessTypeId = restaurantType?.id;
    }

    const restaurant = await this.prisma.business.create({
      data: {
        name: dto.name,
        slug,
        kind,
        businessTypeId,
        description: dto.description,
        logoUrl: dto.logoUrl,
        coverUrl: dto.coverUrl,
        coverPositionX: dto.coverPositionX ?? 50,
        coverPositionY: dto.coverPositionY ?? 50,
        coverScale: dto.coverScale ?? 100,
        phone: dto.phone,
        commissionRate: dto.commissionRate,
        approvalStatus: publishOnSite
          ? BusinessApprovalStatus.APPROVED
          : BusinessApprovalStatus.PENDING,
        isActive: publishOnSite ? true : (dto.isActive ?? false),
        approvedAt: publishOnSite ? new Date() : null,
      },
    });
    await this.upsertPrimaryBranch(restaurant.id, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.branchAddress,
      name: restaurant.name,
    });

    if (dto.ownerLogin && dto.ownerPassword) {
      await this.createBusinessOwner({
        businessId: restaurant.id,
        login: dto.ownerLogin,
        password: dto.ownerPassword,
        fullName: dto.ownerFullName ?? dto.name,
      });
    }

    if (dto.workingHours?.length) {
      await this.schedule.setWorkingHours(restaurant.id, dto.workingHours);
    }

    await this.audit.log({
      userId: user?.sub,
      action: 'create',
      entity: 'restaurant',
      entityId: restaurant.id,
      metadata: { name: restaurant.name, published: publishOnSite },
    });
    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const {
      businessTypeId,
      slug: slugInput,
      latitude,
      longitude,
      branchAddress,
      ownerLogin,
      ownerPassword,
      ownerFullName,
      workingHours,
      ...rest
    } = dto;
    const data: Prisma.BusinessUpdateInput = { ...rest };
    if (businessTypeId !== undefined) {
      if (businessTypeId) {
        const type = await this.prisma.businessType.findUnique({
          where: { id: businessTypeId },
        });
        if (!type) throw new NotFoundException('Business type not found');
        data.kind = type.slug === 'restaurant' ? BusinessKind.RESTAURANT : BusinessKind.STORE;
        data.businessType = { connect: { id: businessTypeId } };
      } else {
        data.kind = BusinessKind.RESTAURANT;
        data.businessType = { disconnect: true };
      }
    }
    if (dto.commissionRate !== undefined) {
      data.commissionRate = dto.commissionRate;
    }
    if (slugInput !== undefined) {
      data.slug = await resolveSlugForUpdate({
        slug: slugInput,
        isTaken: (s) => this.isBusinessSlugTaken(s, id),
      });
    }
    const restaurant = await this.prisma.business.update({ where: { id }, data });

    await this.upsertPrimaryBranch(id, {
      latitude,
      longitude,
      address: branchAddress,
      name: restaurant.name,
    });

    if (workingHours?.length) {
      await this.schedule.setWorkingHours(id, workingHours);
    }

    await this.syncBusinessOwnerOnUpdate(id, restaurant.name, {
      ownerLogin,
      ownerPassword,
      ownerFullName,
    });

    await this.audit.log({
      userId: user.sub,
      action: 'update',
      entity: 'restaurant',
      entityId: id,
      metadata: dto,
    });
    return restaurant;
  }

  async setupOwnerAccount(id: string, dto: SetupOwnerAccountDto, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const restaurant = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    await this.syncBusinessOwnerOnUpdate(id, restaurant.name, {
      ownerLogin: dto.login,
      ownerPassword: dto.password,
      ownerFullName: dto.fullName,
    });

    await this.audit.log({
      userId: user.sub,
      action: 'setup_owner_account',
      entity: 'restaurant',
      entityId: id,
      metadata: { login: dto.login },
    });

    return { ok: true };
  }

  private async syncBusinessOwnerOnUpdate(
    businessId: string,
    businessName: string,
    input: {
      ownerLogin?: string;
      ownerPassword?: string;
      ownerFullName?: string;
    },
  ) {
    const login = input.ownerLogin?.trim();
    const password = input.ownerPassword;
    if (!login && !password) return;

    const staff = await this.prisma.businessStaff.findFirst({
      where: { businessId, deletedAt: null },
      include: { user: true },
    });

    if (!staff) {
      if (!login || !password) {
        throw new BadRequestException(
          'ownerLogin and ownerPassword are required to create owner account',
        );
      }
      await this.createBusinessOwner({
        businessId,
        login,
        password,
        fullName: input.ownerFullName ?? businessName,
      });
      return;
    }

    if (login) {
      await this.updateBusinessOwnerLogin(staff.userId, login);
    }
    if (password) {
      await this.resetBusinessOwnerPassword(businessId, password);
    }
  }

  private async updateBusinessOwnerLogin(userId: string, login: string) {
    const trimmed = login.trim();
    if (!trimmed) return;

    const isEmail = trimmed.includes('@');
    const email = isEmail ? trimmed.toLowerCase() : null;
    const phone = !isEmail ? normalizePhone(trimmed) : null;

    const conflict = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        id: { not: userId },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
    if (conflict) {
      throw new ConflictException('User with this email or phone already exists');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        phone,
      },
    });
  }

  private async loadOwnerCredentialsByBusinessIds(
    businessIds: string[],
    viewer: JwtPayload,
  ): Promise<
    Map<
      string,
      { ownerLogin: string | null; ownerFullName: string | null; ownerPassword: string | null }
    >
  > {
    const map = new Map<
      string,
      { ownerLogin: string | null; ownerFullName: string | null; ownerPassword: string | null }
    >();
    if (!businessIds.length) return map;

    const canSeeLogin =
      viewer.role === UserRole.SUPER_ADMIN || viewer.role === UserRole.MANAGER;
    if (!canSeeLogin) return map;

    const canSeePassword = viewer.role === UserRole.SUPER_ADMIN;
    const staffRows = await this.prisma.businessStaff.findMany({
      where: { businessId: { in: businessIds }, deletedAt: null },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            fullName: true,
            ...(canSeePassword ? { adminPasswordNote: true } : {}),
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const row of staffRows) {
      if (map.has(row.businessId)) continue;
      map.set(row.businessId, {
        ownerLogin: row.user?.email ?? row.user?.phone ?? null,
        ownerFullName: row.user?.fullName ?? null,
        ownerPassword: canSeePassword ? row.user?.adminPasswordNote ?? null : null,
      });
    }

    return map;
  }

  private async createBusinessOwner(params: {
    businessId: string;
    login: string;
    password: string;
    fullName?: string;
  }) {
    const login = params.login.trim();
    const isEmail = login.includes('@');
    const email = isEmail ? login.toLowerCase() : null;
    const phone = !isEmail ? normalizePhone(login) : null;

    const existing = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const passwordHash = await this.auth.hashPassword(params.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        fullName: params.fullName?.trim() || null,
        role: UserRole.BUSINESS,
        passwordHash,
        adminPasswordNote: params.password,
        isActive: true,
      },
    });

    await this.prisma.businessStaff.create({
      data: { userId: user.id, businessId: params.businessId },
    });

    return user;
  }

  private async resetBusinessOwnerPassword(businessId: string, password: string) {
    const staff = await this.prisma.businessStaff.findFirst({
      where: { businessId, deletedAt: null },
      include: { user: true },
    });
    if (!staff?.user) {
      throw new BadRequestException('Business owner account not found');
    }

    const passwordHash = await this.auth.hashPassword(password);
    await this.prisma.user.update({
      where: { id: staff.userId },
      data: { passwordHash, adminPasswordNote: password },
    });
  }

  private async upsertPrimaryBranch(
    businessId: string,
    input: {
      latitude?: number;
      longitude?: number;
      address?: string;
      name?: string;
    },
  ) {
    if (input.latitude == null || input.longitude == null) return;

    const existing = await this.prisma.businessBranch.findFirst({
      where: { businessId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    const address =
      input.address?.trim() ||
      existing?.address ||
      input.name?.trim() ||
      'Main location';

    if (existing) {
      await this.prisma.businessBranch.update({
        where: { id: existing.id },
        data: {
          latitude: input.latitude,
          longitude: input.longitude,
          address,
          isActive: true,
        },
      });
      return;
    }

    await this.prisma.businessBranch.create({
      data: {
        businessId,
        name: 'Main',
        address,
        latitude: input.latitude,
        longitude: input.longitude,
        isActive: true,
      },
    });
  }

  async updateApproval(
    id: string,
    status: BusinessApprovalStatus,
    note: string | undefined,
    user: JwtPayload,
  ) {
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException();
    }
    const restaurant = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const isApproved = status === BusinessApprovalStatus.APPROVED;
    const updated = await this.prisma.business.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvalNote: note,
        approvedAt: isApproved ? new Date() : null,
        isActive: isApproved ? true : status !== BusinessApprovalStatus.REJECTED,
      },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'approval_change',
      entity: 'restaurant',
      entityId: id,
      metadata: { status, note },
    });

    if (status === BusinessApprovalStatus.SUSPENDED) {
      await this.adminNotifications.notifyRestaurantSuspended({
        id: restaurant.id,
        name: restaurant.name,
      });
    }

    return updated;
  }

  async getFinance(id: string, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const restaurant = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const delivered = await this.prisma.order.aggregate({
      where: {
        businessId: id,
        deletedAt: null,
        status: OrderStatus.DELIVERED,
      },
      _sum: { subtotal: true, commissionAmount: true, total: true },
      _count: { _all: true },
    });

    const grossRevenue = Number(delivered._sum.subtotal ?? 0);
    const platformCommission = Number(delivered._sum.commissionAmount ?? 0);
    const netRestaurantRevenue = grossRevenue - platformCommission;

    return {
      businessId: id,
      restaurantName: restaurant.name,
      commissionRate: Number(restaurant.commissionRate),
      completedOrders: delivered._count._all,
      grossRevenue,
      platformCommission,
      netRestaurantRevenue,
      totalOrderValue: Number(delivered._sum.total ?? 0),
    };
  }

  async clearTestData(businessIds: string[], user: JwtPayload) {
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only admin staff can clear restaurant test data');
    }

    const uniqueIds = [...new Set(businessIds)];
    const businesses = await this.prisma.business.findMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
        ...businessWhereForVertical('restaurant'),
      },
      select: { id: true, name: true },
    });

    if (!businesses.length) {
      throw new NotFoundException('No restaurants found for the given ids');
    }

    const results: Array<{
      businessId: string;
      businessName: string;
      ordersDeleted: number;
      guestOrdersDeleted: number;
      adminNotificationsDeleted: number;
      staffNotificationsDeleted: number;
    }> = [];

    for (const business of businesses) {
      const orders = await this.prisma.order.findMany({
        where: { businessId: business.id },
        select: { id: true, guestOrderId: true },
      });
      const orderIds = orders.map((o) => o.id);
      const guestOrderIds = [...new Set(orders.map((o) => o.guestOrderId))];

      if (!orderIds.length) {
        results.push({
          businessId: business.id,
          businessName: business.name,
          ordersDeleted: 0,
          guestOrdersDeleted: 0,
          adminNotificationsDeleted: 0,
          staffNotificationsDeleted: 0,
        });
        continue;
      }

      const cleared = await this.prisma.$transaction(async (tx) => {
        const promoUsageGroups = await tx.promoCodeUsage.groupBy({
          by: ['promoCodeId'],
          where: { orderId: { in: orderIds } },
          _count: { _all: true },
        });

        await tx.courierAssignment.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.transaction.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.promoCodeUsage.deleteMany({ where: { orderId: { in: orderIds } } });

        const adminNotificationsDeleted = await tx.adminNotification.deleteMany({
          where: {
            OR: orderIds.map((orderId) => ({
              metadata: { path: ['orderId'], equals: orderId },
            })),
          },
        });

        const staffNotificationsDeleted = await tx.notification.deleteMany({
          where: {
            OR: orderIds.map((orderId) => ({
              metadata: { path: ['orderId'], equals: orderId },
            })),
          },
        });

        const ordersDeleted = await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        });

        const guestOrdersDeleted = await tx.guestOrder.deleteMany({
          where: { id: { in: guestOrderIds } },
        });

        for (const group of promoUsageGroups) {
          await tx.promoCode.update({
            where: { id: group.promoCodeId },
            data: { usageCount: { decrement: group._count._all } },
          });
        }

        return {
          ordersDeleted: ordersDeleted.count,
          guestOrdersDeleted: guestOrdersDeleted.count,
          adminNotificationsDeleted: adminNotificationsDeleted.count,
          staffNotificationsDeleted: staffNotificationsDeleted.count,
        };
      });

      await this.audit.log({
        userId: user.sub,
        action: 'clear_test_data',
        entity: 'restaurant',
        entityId: business.id,
        metadata: cleared,
      });

      results.push({
        businessId: business.id,
        businessName: business.name,
        ...cleared,
      });
    }

    return { cleared: results };
  }

  async softDelete(id: string, user: JwtPayload) {
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can delete restaurants');
    }
    const restaurant = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const deleted = await this.prisma.business.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'delete',
      entity: 'restaurant',
      entityId: id,
    });
    return deleted;
  }

  assertAccess(businessId: string, user: JwtPayload) {
    this.assertRestaurantAccess(businessId, user);
  }

  private assertRestaurantAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    const scope = userBusinessId(user);
    if (scope !== businessId) throw new ForbiddenException();
  }
}
