import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findByRestaurant(restaurantId: string) {
    return this.prisma.category.findMany({
      where: { restaurantId, deletedAt: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(data: { restaurantId: string; name: string; slug: string }, user: JwtPayload) {
    this.assertAccess(data.restaurantId, user);
    return this.prisma.category.create({ data });
  }

  private assertAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
