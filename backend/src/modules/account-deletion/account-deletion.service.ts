import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountDeletionRequestStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePhone } from '../../common/utils/phone.util';
import { CustomersService } from '../customers/customers.service';
import {
  CUSTOMER_JWT_ROLE,
  CustomerJwtPayload,
} from '../customers/customer-token.service';
import { DeleteAccountRequestDto } from './dto/delete-account-request.dto';

const GENERIC_SUCCESS =
  'Your account deletion request has been received. If an account exists for this phone number, it has been scheduled for deletion.';

@Injectable()
export class AccountDeletionService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
    private jwt: JwtService,
  ) {}

  parseOptionalCustomer(authHeader?: string): CustomerJwtPayload | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
      const payload = this.jwt.verify<CustomerJwtPayload>(authHeader.slice(7));
      if (payload.role !== CUSTOMER_JWT_ROLE) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async createDeleteRequest(
    dto: DeleteAccountRequestDto,
    authHeader?: string,
  ) {
    const phone = normalizePhone(dto.phone);
    const jwtCustomer = this.parseOptionalCustomer(authHeader);

    if (jwtCustomer) {
      return this.processAuthenticatedRequest(dto, phone, jwtCustomer);
    }

    return this.processPublicRequest(dto, phone);
  }

  private async processAuthenticatedRequest(
    dto: DeleteAccountRequestDto,
    phone: string,
    jwtCustomer: CustomerJwtPayload,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: jwtCustomer.sub, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundException('Account not found');
    }

    if (!customer.phone) {
      throw new ForbiddenException(
        'Add a phone number to your profile before deleting your account.',
      );
    }

    if (normalizePhone(customer.phone) !== phone) {
      throw new ForbiddenException('Phone number does not match your account');
    }

    const request = await this.createRequestRecord({
      userId: customer.id,
      phone,
      email: dto.email?.trim() || customer.email,
      reason: dto.reason?.trim(),
      status: AccountDeletionRequestStatus.PROCESSING,
    });

    await this.customers.deleteCustomerAccount(customer.id, {
      requestId: request.id,
      source: 'authenticated',
    });

    await this.prisma.accountDeletionRequest.update({
      where: { id: request.id },
      data: {
        status: AccountDeletionRequestStatus.COMPLETED,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message:
        'Your account and personal data have been deleted. This action is permanent.',
      requestId: request.id,
    };
  }

  private async processPublicRequest(dto: DeleteAccountRequestDto, phone: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });

    if (!customer) {
      await this.createRequestRecord({
        phone,
        email: dto.email?.trim(),
        reason: dto.reason?.trim(),
        status: AccountDeletionRequestStatus.FAILED,
      });
      return { success: true, message: GENERIC_SUCCESS };
    }

    const request = await this.createRequestRecord({
      userId: customer.id,
      phone,
      email: dto.email?.trim() || customer.email,
      reason: dto.reason?.trim(),
      status: AccountDeletionRequestStatus.PROCESSING,
    });

    await this.customers.deleteCustomerAccount(customer.id, {
      requestId: request.id,
      source: 'public_form',
    });

    await this.prisma.accountDeletionRequest.update({
      where: { id: request.id },
      data: {
        status: AccountDeletionRequestStatus.COMPLETED,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: GENERIC_SUCCESS };
  }

  private createRequestRecord(data: {
    userId?: string;
    phone: string;
    email?: string | null;
    reason?: string;
    status: AccountDeletionRequestStatus;
  }) {
    return this.prisma.accountDeletionRequest.create({
      data: {
        userId: data.userId,
        phone: data.phone,
        email: data.email ?? null,
        reason: data.reason ?? null,
        status: data.status,
      },
    });
  }
}
