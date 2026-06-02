import { ForbiddenException, Injectable } from '@nestjs/common';
import { CustomerAuthProvider, Prisma } from '@prisma/client';

type CustomerWithLoyalty = Prisma.CustomerGetPayload<{ include: { loyalty: true } }>;
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { CustomerTokenService } from '../customers/customer-token.service';
import {
  CustomerAuthResult,
  TelegramSignedPayload,
  VerifiedTelegramUser,
} from './types/telegram-auth.types';
import { TelegramSignatureService } from './telegram-signature.service';

/**
 * Platform-agnostic Telegram customer authentication.
 * Accepts a cryptographically verified Telegram user, upserts the customer, returns JWT.
 * Web (Login Widget), Flutter, and other clients use the same flow after obtaining a signed payload.
 */
@Injectable()
export class TelegramAuthService {
  constructor(
    private prisma: PrismaService,
    private signature: TelegramSignatureService,
    private customerTokens: CustomerTokenService,
    private bruteForce: BruteForceService,
  ) {}

  /**
   * Full sign-in for HTTP/mobile clients: verify HMAC, then issue JWT.
   * Flutter: POST the signed object from Telegram SDK to `/api/v1/auth/telegram`.
   */
  async signInWithTelegramPayload(
    payload: TelegramSignedPayload,
    clientIp = 'unknown',
  ): Promise<CustomerAuthResult> {
    const scopeKey = `${clientIp}:telegram:${payload.id}`;
    await this.bruteForce.assertNotBlocked('customer-auth', scopeKey);

    try {
      const verified = this.signature.verify(payload);
      const result = await this.authenticateVerifiedUser(verified);
      await this.bruteForce.clearFailures('customer-auth', scopeKey);
      return result;
    } catch (err) {
      await this.bruteForce.recordFailure('customer-auth', scopeKey);
      throw err;
    }
  }

  /**
   * Core entry point when the caller has already verified the signature
   * (e.g. unit tests or a trusted internal pipeline).
   */
  async authenticateVerifiedUser(
    verified: VerifiedTelegramUser,
  ): Promise<CustomerAuthResult> {
    const customer = await this.upsertCustomerFromTelegram(verified);
    return this.customerTokens.issueToken(customer);
  }

  private displayName(verified: VerifiedTelegramUser): string {
    return [verified.firstName, verified.lastName].filter(Boolean).join(' ').trim();
  }

  private telegramProfilePatch(
    verified: VerifiedTelegramUser,
  ): Prisma.CustomerUpdateInput {
    return {
      telegramId: verified.telegramId,
      telegramUsername: verified.username ?? null,
      telegramFirstName: verified.firstName,
      telegramLastName: verified.lastName ?? null,
      telegramPhotoUrl: verified.photoUrl ?? null,
      isTelegramVerified: true,
      lastTelegramLoginAt: new Date(),
      authProvider: CustomerAuthProvider.TELEGRAM,
    };
  }

  private async upsertCustomerFromTelegram(
    verified: VerifiedTelegramUser,
  ): Promise<CustomerWithLoyalty> {
    const telegramData = this.telegramProfilePatch(verified);
    const name = this.displayName(verified) || verified.firstName;

    const existing = await this.prisma.customer.findFirst({
      where: { telegramId: verified.telegramId, deletedAt: null },
      include: { loyalty: true },
    });

    if (!existing) {
      return this.prisma.customer.create({
        data: {
          fullName: name,
          ...telegramData,
        } as Prisma.CustomerCreateInput,
        include: { loyalty: true },
      });
    }

    if (!existing.isActive) {
      throw new ForbiddenException('Account is blocked. Contact support.');
    }

    return this.prisma.customer.update({
      where: { id: existing.id },
      data: {
        ...telegramData,
        fullName: existing.fullName || name,
      },
      include: { loyalty: true },
    });
  }
}
