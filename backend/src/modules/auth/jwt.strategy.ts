import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }): Promise<JwtPayload> {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
      include: {
        businessStaff: {
          where: { deletedAt: null },
          take: 1,
        },
      },
    });
    if (!user) throw new UnauthorizedException();

    return {
      sub: user.id,
      email: user.email ?? '',
      role: user.role,
      businessId: user.businessStaff[0]?.businessId,
      restaurantId: user.businessStaff[0]?.businessId,
    };
  }
}
