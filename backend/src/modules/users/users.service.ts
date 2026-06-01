import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { normalizePhone } from '../../common/utils/phone.util';

const RESTAURANT_ROLES: UserRole[] = [UserRole.RESTAURANT_OWNER, UserRole.RESTAURANT_STAFF];

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
  ) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() ? normalizePhone(dto.phone) : null;

    if (RESTAURANT_ROLES.includes(dto.role) && !dto.restaurantId) {
      throw new BadRequestException('restaurantId is required for restaurant roles');
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    if (dto.restaurantId) {
      const restaurant = await this.prisma.restaurant.findFirst({
        where: { id: dto.restaurantId, deletedAt: null },
      });
      if (!restaurant) throw new BadRequestException('Restaurant not found');
    }

    const passwordHash = await this.auth.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        fullName: dto.fullName?.trim() || null,
        role: dto.role,
        passwordHash,
        isActive: true,
      },
    });

    if (dto.role === UserRole.MANAGER) {
      await this.prisma.manager.create({ data: { userId: user.id } });
    }
    if (dto.role === UserRole.COURIER) {
      await this.prisma.courier.create({ data: { userId: user.id } });
    }
    if (dto.restaurantId && RESTAURANT_ROLES.includes(dto.role)) {
      await this.prisma.restaurantStaff.create({
        data: { userId: user.id, restaurantId: dto.restaurantId },
      });
    }

    return this.serializeUser(
      await this.prisma.user.findFirstOrThrow({
        where: { id: user.id },
        include: {
          restaurantStaff: {
            where: { deletedAt: null },
            include: { restaurant: { select: { id: true, name: true } } },
            take: 1,
          },
        },
      }),
    );
  }

  async findAll(role?: UserRole) {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, ...(role && { role }) },
      include: {
        restaurantStaff: {
          where: { deletedAt: null },
          include: { restaurant: { select: { id: true, name: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.serializeUser(u));
  }

  private serializeUser(user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    restaurantStaff?: { restaurant: { id: string; name: string } }[];
  }) {
    const staff = user.restaurantStaff?.[0];
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      restaurant: staff?.restaurant ?? null,
    };
  }
}
