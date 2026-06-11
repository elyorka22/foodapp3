import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountDeletionService } from './account-deletion.service';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CUSTOMER_JWT_ROLE } from '../customers/customer-token.service';

describe('AccountDeletionService', () => {
  const prisma = {
    customer: { findFirst: jest.fn() },
    accountDeletionRequest: { create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;

  const customers = {
    deleteCustomerAccount: jest.fn(),
  } as unknown as CustomersService;

  const jwt = {
    verify: jest.fn(),
  } as unknown as JwtService;

  const service = new AccountDeletionService(prisma, customers, jwt);

  beforeEach(() => jest.clearAllMocks());

  it('rejects authenticated deletion when phone does not match', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      sub: 'cust-1',
      role: CUSTOMER_JWT_ROLE,
      authProvider: 'PHONE',
    });
    (prisma.customer.findFirst as jest.Mock).mockResolvedValue({
      id: 'cust-1',
      phone: '+998901111111',
      email: null,
      deletedAt: null,
    });

    await expect(
      service.createDeleteRequest(
        { phone: '+998902222222' },
        'Bearer token',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
