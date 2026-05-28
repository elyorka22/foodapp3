import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
  ) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await this.auth.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        role: dto.role,
        passwordHash,
      },
    });

    if (dto.role === UserRole.MANAGER) {
      await this.prisma.manager.create({ data: { userId: user.id } });
    }
    if (dto.role === UserRole.COURIER) {
      await this.prisma.courier.create({ data: { userId: user.id } });
    }
    if (dto.restaurantId && (dto.role === UserRole.RESTAURANT_OWNER || dto.role === UserRole.RESTAURANT_STAFF)) {
      await this.prisma.restaurantStaff.create({
        data: { userId: user.id, restaurantId: dto.restaurantId },
      });
    }

    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async findAll(role?: UserRole) {
    return this.prisma.user.findMany({
      where: { deletedAt: null, ...(role && { role }) },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
