import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePhone } from '../../common/utils/phone.util';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private serialize(customer: {
    id: string;
    phone: string;
    fullName: string;
    email: string | null;
    createdAt: Date;
  }) {
    return {
      id: customer.id,
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email ?? undefined,
      createdAt: customer.createdAt,
    };
  }

  async register(dto: RegisterCustomerDto) {
    const phone = normalizePhone(dto.phone);

    const existing = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Phone already registered. Please log in.');
    }

    const customer = await this.prisma.customer.create({
      data: {
        phone,
        fullName: dto.fullName.trim(),
        email: dto.email?.trim() || null,
      },
    });

    return { customer: this.serialize(customer) };
  }

  async login(dto: LoginCustomerDto) {
    const phone = normalizePhone(dto.phone);

    const customer = await this.prisma.customer.findFirst({
      where: { phone, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundException('Account not found. Please register first.');
    }

    return { customer: this.serialize(customer) };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return { customer: this.serialize(customer) };
  }
}
