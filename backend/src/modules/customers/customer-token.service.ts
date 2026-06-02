import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Customer, CustomerAuthProvider, CustomerLoyalty } from '@prisma/client';

export const CUSTOMER_JWT_ROLE = 'CUSTOMER';

export type CustomerJwtPayload = {
  sub: string;
  role: typeof CUSTOMER_JWT_ROLE;
  authProvider: CustomerAuthProvider;
};

export type SerializedCustomer = {
  id: string;
  phone?: string;
  fullName: string;
  email?: string;
  isActive: boolean;
  referralCode?: string;
  loyalty?: { points: number; level: string };
  createdAt: Date;
  telegramId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  authProvider?: CustomerAuthProvider;
  isTelegramVerified: boolean;
  lastTelegramLoginAt?: Date;
  needsPhone: boolean;
  defaultDeliveryAddress?: string;
};

@Injectable()
export class CustomerTokenService {
  constructor(private jwt: JwtService) {}

  serialize(
    customer: Customer & { loyalty?: CustomerLoyalty | null },
  ): SerializedCustomer {
    return {
      id: customer.id,
      phone: customer.phone ?? undefined,
      fullName: customer.fullName,
      email: customer.email ?? undefined,
      isActive: customer.isActive,
      referralCode: customer.referralCode ?? undefined,
      loyalty: customer.loyalty
        ? { points: customer.loyalty.points, level: customer.loyalty.level }
        : undefined,
      createdAt: customer.createdAt,
      telegramId: customer.telegramId?.toString(),
      telegramUsername: customer.telegramUsername ?? undefined,
      telegramFirstName: customer.telegramFirstName ?? undefined,
      telegramLastName: customer.telegramLastName ?? undefined,
      telegramPhotoUrl: customer.telegramPhotoUrl ?? undefined,
      authProvider: customer.authProvider ?? undefined,
      isTelegramVerified: customer.isTelegramVerified,
      lastTelegramLoginAt: customer.lastTelegramLoginAt ?? undefined,
      needsPhone: !customer.phone,
      defaultDeliveryAddress: customer.defaultDeliveryAddress ?? undefined,
    };
  }

  issueToken(
    customer: Customer & { loyalty?: CustomerLoyalty | null },
  ): { accessToken: string; user: SerializedCustomer } {
    const authProvider = customer.authProvider ?? CustomerAuthProvider.PHONE;
    const payload: CustomerJwtPayload = {
      sub: customer.id,
      role: CUSTOMER_JWT_ROLE,
      authProvider,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: this.serialize(customer),
    };
  }
}
