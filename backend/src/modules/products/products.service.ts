import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findByRestaurant(restaurantId: string, categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        restaurantId,
        deletedAt: null,
        ...(categoryId && { categoryId }),
      },
      include: { images: true, category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateProductDto, user: JwtPayload) {
    this.assertAccess(dto.restaurantId, user);
    return this.prisma.product.create({
      data: {
        ...dto,
        price: dto.price,
      },
      include: { images: true },
    });
  }

  async update(id: string, dto: Partial<CreateProductDto>, user: JwtPayload) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException();
    this.assertAccess(product.restaurantId, user);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  async softDelete(id: string, user: JwtPayload) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException();
    this.assertAccess(product.restaurantId, user);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
    });
  }

  private assertAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
