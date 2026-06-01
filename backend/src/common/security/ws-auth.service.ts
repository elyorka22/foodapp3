import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class WsAuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async verifySocketToken(token: string | undefined): Promise<JwtPayload | null> {
    if (!token?.trim()) return null;
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; role: string }>(token);
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, deletedAt: null, isActive: true },
        include: { businessStaff: { take: 1 } },
      });
      if (!user) return null;
      return {
        sub: user.id,
        email: user.email ?? '',
        role: user.role,
        businessId: user.businessStaff[0]?.businessId,
        restaurantId: user.businessStaff[0]?.businessId,
      };
    } catch {
      return null;
    }
  }

  requireUser(user: JwtPayload | null): JwtPayload {
    if (!user) throw new UnauthorizedException('WebSocket authentication required');
    return user;
  }

  assertAdmin(user: JwtPayload) {
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Admin room access denied');
    }
  }

  assertManager(user: JwtPayload) {
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER) {
      throw new UnauthorizedException('Manager room access denied');
    }
  }

  assertBusiness(user: JwtPayload, businessId: string) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    const userBusinessId = user.businessId ?? user.restaurantId;
    if (user.role === UserRole.BUSINESS && userBusinessId === businessId) {
      return;
    }
    throw new UnauthorizedException('Business room access denied');
  }

  /** @deprecated use assertBusiness */
  assertRestaurant(user: JwtPayload, businessId: string) {
    return this.assertBusiness(user, businessId);
  }

  async assertCourier(user: JwtPayload, courierId: string) {
    if (user.role !== UserRole.COURIER) {
      throw new UnauthorizedException('Courier room access denied');
    }
    const courier = await this.prisma.courier.findFirst({
      where: { id: courierId, userId: user.sub, deletedAt: null },
    });
    if (!courier) throw new UnauthorizedException('Courier room access denied');
  }

  async assertTrackingToken(trackingToken: string) {
    const order = await this.prisma.order.findFirst({
      where: { trackingToken, deletedAt: null },
      select: { id: true },
    });
    if (!order) throw new UnauthorizedException('Invalid tracking token');
  }
}
