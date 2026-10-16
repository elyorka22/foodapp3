import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { userBusinessId } from '../../domain/business/business-id.util';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BusinessBranchesService {
  constructor(private prisma: PrismaService) {}

  async list(businessId: string, user: JwtPayload) {
    await this.assertAccess(businessId, user);
    return this.prisma.businessBranch.findMany({
      where: { businessId, deletedAt: null },
      include: { city: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(businessId: string, dto: CreateBranchDto, user: JwtPayload) {
    await this.assertAccess(businessId, user);
    await this.ensureBusiness(businessId);
    await this.ensureCity(dto.cityId);

    const makePrimary = dto.isPrimary === true;
    if (makePrimary) {
      await this.clearPrimary(businessId);
    } else {
      const hasPrimary = await this.prisma.businessBranch.findFirst({
        where: { businessId, deletedAt: null, isPrimary: true },
        select: { id: true },
      });
      if (!hasPrimary) {
        // First branch becomes primary
        dto.isPrimary = true;
      }
    }

    return this.prisma.businessBranch.create({
      data: {
        businessId,
        cityId: dto.cityId,
        name: dto.name.trim(),
        address: dto.address.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone?.trim(),
        isActive: dto.isActive ?? true,
        isPrimary: dto.isPrimary ?? false,
      },
      include: { city: { select: { id: true, name: true, slug: true } } },
    });
  }

  async update(
    businessId: string,
    branchId: string,
    dto: UpdateBranchDto,
    user: JwtPayload,
  ) {
    await this.assertAccess(businessId, user);
    const branch = await this.ensureBranch(businessId, branchId);
    if (dto.cityId) await this.ensureCity(dto.cityId);

    if (dto.isPrimary === true) {
      await this.clearPrimary(businessId, branchId);
    }
    if (dto.isPrimary === false && branch.isPrimary) {
      throw new BadRequestException(
        'Set another branch as primary instead of unsetting the only primary',
      );
    }

    return this.prisma.businessBranch.update({
      where: { id: branchId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.address !== undefined && { address: dto.address.trim() }),
        ...(dto.cityId !== undefined && { cityId: dto.cityId }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      include: { city: { select: { id: true, name: true, slug: true } } },
    });
  }

  async setPrimary(businessId: string, branchId: string, user: JwtPayload) {
    await this.assertAccess(businessId, user);
    await this.ensureBranch(businessId, branchId);
    await this.clearPrimary(businessId, branchId);
    return this.prisma.businessBranch.update({
      where: { id: branchId },
      data: { isPrimary: true, isActive: true },
      include: { city: { select: { id: true, name: true, slug: true } } },
    });
  }

  async softDelete(businessId: string, branchId: string, user: JwtPayload) {
    await this.assertAccess(businessId, user);
    const branch = await this.ensureBranch(businessId, branchId);
    const activeCount = await this.prisma.businessBranch.count({
      where: { businessId, deletedAt: null, isActive: true },
    });
    if (activeCount <= 1) {
      throw new BadRequestException('Cannot delete the last active branch');
    }
    await this.prisma.businessBranch.update({
      where: { id: branchId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        isPrimary: false,
        name: `${branch.name}-deleted-${Date.now()}`,
      },
    });
    if (branch.isPrimary) {
      const next = await this.prisma.businessBranch.findFirst({
        where: { businessId, deletedAt: null, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.businessBranch.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
    return { ok: true };
  }

  private async clearPrimary(businessId: string, exceptId?: string) {
    await this.prisma.businessBranch.updateMany({
      where: {
        businessId,
        deletedAt: null,
        isPrimary: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { isPrimary: false },
    });
  }

  private async ensureBusiness(id: string) {
    const row = await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, cityId: true },
    });
    if (!row) throw new NotFoundException('Business not found');
    return row;
  }

  private async ensureCity(cityId: string) {
    const city = await this.prisma.city.findFirst({
      where: { id: cityId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  private async ensureBranch(businessId: string, branchId: string) {
    const branch = await this.prisma.businessBranch.findFirst({
      where: { id: branchId, businessId, deletedAt: null },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  private assertAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
      return;
    }
    if (user.role === UserRole.BUSINESS && userBusinessId(user) === businessId) {
      return;
    }
    throw new ForbiddenException();
  }
}
