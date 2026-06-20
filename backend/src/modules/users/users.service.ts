import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { normalizePhone } from '../../common/utils/phone.util';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

const BUSINESS_ROLES: UserRole[] = [UserRole.BUSINESS];

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
  ) {}

  private assertManagerCanManageRole(actor: JwtPayload | undefined, targetRole: UserRole) {
    if (actor?.role !== UserRole.MANAGER) return;
    if (targetRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Managers cannot manage super admin accounts');
    }
  }

  async create(dto: CreateUserDto, actor?: JwtPayload) {
    this.assertManagerCanManageRole(actor, dto.role);

    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() ? normalizePhone(dto.phone) : null;

    if (BUSINESS_ROLES.includes(dto.role) && !dto.restaurantId) {
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
      const restaurant = await this.prisma.business.findFirst({
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
        adminPasswordNote: dto.password,
        isActive: true,
      },
    });

    if (dto.role === UserRole.MANAGER) {
      await this.prisma.manager.create({ data: { userId: user.id } });
    }
    if (dto.role === UserRole.COURIER) {
      await this.prisma.courier.create({ data: { userId: user.id } });
    }
    if (dto.restaurantId && BUSINESS_ROLES.includes(dto.role)) {
      await this.prisma.businessStaff.create({
        data: { userId: user.id, businessId: dto.restaurantId },
      });
    }

    return this.serializeUser(
      await this.prisma.user.findFirstOrThrow({
        where: { id: user.id },
        include: {
          businessStaff: {
            where: { deletedAt: null },
            include: { business: { select: { id: true, name: true } } },
            take: 1,
          },
        },
      }),
      actor,
    );
  }

  async findAll(role?: UserRole, actor?: JwtPayload) {
    if (actor?.role === UserRole.MANAGER && role === UserRole.SUPER_ADMIN) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(actor?.role === UserRole.MANAGER
          ? { role: role ? role : { not: UserRole.SUPER_ADMIN } }
          : role && { role }),
      },
      include: {
        businessStaff: {
          where: { deletedAt: null },
          include: { business: { select: { id: true, name: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.serializeUser(u, actor));
  }

  async update(id: string, dto: UpdateUserDto, actor: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        businessStaff: {
          where: { deletedAt: null },
          include: { business: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    this.assertManagerCanManageRole(actor, user.role);

    if (dto.isActive === false && user.id === actor.sub) {
      throw new ForbiddenException('You cannot block your own account');
    }

    const data: {
      isActive?: boolean;
      fullName?: string | null;
      phone?: string | null;
      passwordHash?: string;
      adminPasswordNote?: string;
    } = {};

    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim() || null;
    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim() ? normalizePhone(dto.phone) : null;
    }
    if (dto.password) {
      data.passwordHash = await this.auth.hashPassword(dto.password);
      data.adminPasswordNote = dto.password;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        businessStaff: {
          where: { deletedAt: null },
          include: { business: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    });

    return this.serializeUser(updated, actor);
  }

  private serializeUser(
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      fullName: string | null;
      role: UserRole;
      isActive: boolean;
      adminPasswordNote?: string | null;
      createdAt: Date;
      businessStaff?: { business: { id: string; name: string } }[];
    },
    actor?: JwtPayload,
  ) {
    const staff = user.businessStaff?.[0];
    const merchant = staff?.business ?? null;
    const canSeePassword = actor?.role === UserRole.SUPER_ADMIN;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      adminPasswordNote: canSeePassword ? user.adminPasswordNote ?? null : null,
      createdAt: user.createdAt,
      business: merchant,
      restaurant: merchant,
    };
  }
}
