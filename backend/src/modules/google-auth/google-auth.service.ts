import { ForbiddenException, Injectable } from '@nestjs/common';
import { CustomerAuthProvider, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BruteForceService } from '../../common/security/brute-force.service';
import { CustomerTokenService } from '../customers/customer-token.service';
import { GoogleTokenService } from './google-token.service';
import { CustomerAuthResult } from './types/google-auth.types';

type CustomerWithLoyalty = Prisma.CustomerGetPayload<{ include: { loyalty: true } }>;

@Injectable()
export class GoogleAuthService {
  constructor(
    private prisma: PrismaService,
    private googleToken: GoogleTokenService,
    private customerTokens: CustomerTokenService,
    private bruteForce: BruteForceService,
  ) {}

  async signInWithIdToken(idToken: string, clientIp = 'unknown'): Promise<CustomerAuthResult> {
    const scopeKey = `${clientIp}:google:token`;
    await this.bruteForce.assertNotBlocked('customer-auth', scopeKey);

    try {
      const verified = await this.googleToken.verifyIdToken(idToken);
      const scopeKeyUid = `${clientIp}:google:${verified.uid}`;
      await this.bruteForce.assertNotBlocked('customer-auth', scopeKeyUid);

      const customer = await this.upsertCustomerFromGoogle(verified);
      const result = this.customerTokens.issueToken(customer);

      await this.bruteForce.clearFailures('customer-auth', scopeKey);
      await this.bruteForce.clearFailures('customer-auth', scopeKeyUid);
      return result;
    } catch (err) {
      await this.bruteForce.recordFailure('customer-auth', scopeKey);
      throw err;
    }
  }

  private googleProfilePatch(verified: {
    uid: string;
    email: string;
    name: string;
    picture?: string;
  }): Prisma.CustomerUpdateInput {
    return {
      googleId: verified.uid,
      email: verified.email,
      googlePhotoUrl: verified.picture ?? null,
      isGoogleVerified: true,
      lastGoogleLoginAt: new Date(),
      authProvider: CustomerAuthProvider.GOOGLE,
    };
  }

  private async upsertCustomerFromGoogle(verified: {
    uid: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<CustomerWithLoyalty> {
    const patch = this.googleProfilePatch(verified);

    const byGoogleId = await this.prisma.customer.findFirst({
      where: { googleId: verified.uid, deletedAt: null },
      include: { loyalty: true },
    });
    if (byGoogleId) {
      return this.updateActiveCustomer(byGoogleId, patch, verified.name);
    }

    const byEmail = await this.prisma.customer.findFirst({
      where: {
        email: { equals: verified.email, mode: 'insensitive' },
        deletedAt: null,
      },
      include: { loyalty: true },
    });
    if (byEmail) {
      return this.updateActiveCustomer(byEmail, patch, verified.name);
    }

    return this.prisma.customer.create({
      data: {
        fullName: verified.name,
        ...patch,
      } as Prisma.CustomerCreateInput,
      include: { loyalty: true },
    });
  }

  private async updateActiveCustomer(
    existing: CustomerWithLoyalty,
    patch: Prisma.CustomerUpdateInput,
    fallbackName: string,
  ): Promise<CustomerWithLoyalty> {
    if (!existing.isActive) {
      throw new ForbiddenException('Account is blocked. Contact support.');
    }

    return this.prisma.customer.update({
      where: { id: existing.id },
      data: {
        ...patch,
        fullName: existing.fullName?.trim() ? existing.fullName : fallbackName,
      },
      include: { loyalty: true },
    });
  }
}
