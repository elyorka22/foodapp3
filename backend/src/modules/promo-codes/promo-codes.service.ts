import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PromoCodeType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoDto } from './dto/validate-promo.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return this.prisma.promoCode.findUnique({
      where: { id },
      include: { usages: { take: 20, orderBy: { createdAt: 'desc' } } },
    });
  }

  create(dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        type: dto.type,
        value: dto.value,
        minimumOrderAmount: dto.minimumOrderAmount,
        maximumDiscount: dto.maximumDiscount,
        usageLimit: dto.usageLimit,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  update(id: string, dto: Partial<CreatePromoCodeDto>) {
    const data: Prisma.PromoCodeUpdateInput = {};
    if (dto.code) data.code = dto.code.trim().toUpperCase();
    if (dto.type) data.type = dto.type;
    if (dto.value !== undefined) data.value = dto.value;
    if (dto.minimumOrderAmount !== undefined) data.minimumOrderAmount = dto.minimumOrderAmount;
    if (dto.maximumDiscount !== undefined) data.maximumDiscount = dto.maximumDiscount;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.promoCode.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.promoCode.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private computeDiscount(
    promo: { type: PromoCodeType; value: Prisma.Decimal; maximumDiscount?: Prisma.Decimal | null },
    subtotal: number,
  ) {
    let discount =
      promo.type === PromoCodeType.FIXED
        ? Number(promo.value)
        : (subtotal * Number(promo.value)) / 100;
    if (promo.maximumDiscount) {
      discount = Math.min(discount, Number(promo.maximumDiscount));
    }
    return Math.min(discount, subtotal);
  }

  private checkPromoEligibility(
    promo: {
      isActive: boolean;
      startsAt: Date | null;
      expiresAt: Date | null;
      usageLimit: number | null;
      usageCount: number;
      minimumOrderAmount: Prisma.Decimal | null;
      type: PromoCodeType;
      value: Prisma.Decimal;
      maximumDiscount: Prisma.Decimal | null;
    },
    subtotal: number,
  ) {
    const now = new Date();
    if (!promo.isActive) {
      return { valid: false as const, message: 'Promo code not found', discount: 0 };
    }
    if (promo.startsAt && promo.startsAt > now) {
      return { valid: false as const, message: 'Promo code not yet active', discount: 0 };
    }
    if (promo.expiresAt && promo.expiresAt < now) {
      return { valid: false as const, message: 'Promo code expired', discount: 0 };
    }
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return { valid: false as const, message: 'Promo code usage limit reached', discount: 0 };
    }
    if (promo.minimumOrderAmount && subtotal < Number(promo.minimumOrderAmount)) {
      return {
        valid: false as const,
        message: `Minimum order ${Number(promo.minimumOrderAmount)} UZS required`,
        discount: 0,
      };
    }
    const discount = this.computeDiscount(promo, subtotal);
    return { valid: true as const, message: 'Promo applied', discount };
  }

  async validate(dto: ValidatePromoDto) {
    const promo = await this.prisma.promoCode.findFirst({
      where: { code: dto.code.trim().toUpperCase(), isActive: true },
    });
    if (!promo) {
      return { valid: false, message: 'Promo code not found', discount: 0 };
    }
    const result = this.checkPromoEligibility(promo, dto.subtotal);
    if (!result.valid) return result;
    return {
      valid: true,
      message: result.message,
      discount: result.discount,
      promoCodeId: promo.id,
      code: promo.code,
      type: promo.type,
    };
  }

  /** Atomic promo reservation inside an order transaction. */
  async applyInTransaction(
    tx: TxClient,
    promoCode: string,
    subtotal: number,
    orderId: string,
    customerId: string | undefined,
  ): Promise<{ discountAmount: number; promoCodeId: string }> {
    const promo = await tx.promoCode.findFirst({
      where: { code: promoCode.trim().toUpperCase(), isActive: true },
    });
    if (!promo) {
      throw new BadRequestException('Invalid promo code');
    }

    const check = this.checkPromoEligibility(promo, subtotal);
    if (!check.valid) {
      throw new BadRequestException(check.message ?? 'Invalid promo code');
    }

    const updated = await tx.promoCode.updateMany({
      where: {
        id: promo.id,
        isActive: true,
        AND: [
          { usageCount: promo.usageCount },
          ...(promo.usageLimit != null ? [{ usageCount: { lt: promo.usageLimit } }] : []),
        ],
      },
      data: { usageCount: { increment: 1 } },
    });

    if (updated.count !== 1) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    await tx.promoCodeUsage.create({
      data: {
        promoCodeId: promo.id,
        orderId,
        customerId,
        discountAmount: check.discount,
      },
    });

    return { discountAmount: check.discount, promoCodeId: promo.id };
  }

  async applyToOrder(
    promoCodeId: string,
    orderId: string,
    customerId: string | undefined,
    discountAmount: number,
  ) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id: promoCodeId } });
    if (!promo) throw new NotFoundException('Promo code not found');

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.promoCode.updateMany({
        where: {
          id: promoCodeId,
          isActive: true,
          AND: [
            { usageCount: promo.usageCount },
            ...(promo.usageLimit != null ? [{ usageCount: { lt: promo.usageLimit } }] : []),
          ],
        },
        data: { usageCount: { increment: 1 } },
      });
      if (updated.count !== 1) {
        throw new BadRequestException('Promo code usage limit reached');
      }
      await tx.promoCodeUsage.create({
        data: { promoCodeId, orderId, customerId, discountAmount },
      });
    });
  }
}
