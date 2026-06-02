import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CUSTOMER_JWT_ROLE,
  CustomerJwtPayload,
} from './customer-token.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  async validate(payload: CustomerJwtPayload): Promise<CustomerJwtPayload> {
    if (payload.role !== CUSTOMER_JWT_ROLE) {
      throw new UnauthorizedException();
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
    });
    if (!customer) throw new UnauthorizedException();

    return payload;
  }
}
