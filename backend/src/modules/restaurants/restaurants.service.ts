import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, paginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(query: PaginationDto) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.RestaurantWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { branches: { where: { isActive: true }, take: 1 } },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        branches: { where: { isActive: true } },
        categories: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isAvailable: true, deletedAt: null },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findAllAdmin(query: PaginationDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.RestaurantWhereInput = { deletedAt: null };

    if (user.role === UserRole.RESTAURANT_OWNER || user.role === UserRole.RESTAURANT_STAFF) {
      if (!user.restaurantId) throw new ForbiddenException();
      where.id = user.restaurantId;
    }

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.restaurant.count({ where }),
    ]);

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async create(dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateRestaurantDto>, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  private assertRestaurantAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
