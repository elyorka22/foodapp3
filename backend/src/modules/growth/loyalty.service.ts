import { Injectable } from '@nestjs/common';
import { LoyaltyLevel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const LEVEL_THRESHOLDS: { level: LoyaltyLevel; min: number }[] = [
  { level: LoyaltyLevel.PLATINUM, min: 5000 },
  { level: LoyaltyLevel.GOLD, min: 2000 },
  { level: LoyaltyLevel.SILVER, min: 500 },
  { level: LoyaltyLevel.BRONZE, min: 0 },
];

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  private levelForPoints(points: number): LoyaltyLevel {
    for (const t of LEVEL_THRESHOLDS) {
      if (points >= t.min) return t.level;
    }
    return LoyaltyLevel.BRONZE;
  }

  async getOrCreate(customerId: string) {
    const existing = await this.prisma.customerLoyalty.findUnique({ where: { customerId } });
    if (existing) return existing;
    return this.prisma.customerLoyalty.create({
      data: { customerId, points: 0, level: LoyaltyLevel.BRONZE },
    });
  }

  async awardOrderPoints(customerId: string, orderTotal: number) {
    const pointsEarned = Math.floor(orderTotal / 1000);
    if (pointsEarned <= 0) return;

    const loyalty = await this.getOrCreate(customerId);
    const newPoints = loyalty.points + pointsEarned;
    await this.prisma.customerLoyalty.update({
      where: { customerId },
      data: { points: newPoints, level: this.levelForPoints(newPoints) },
    });
  }

  async processReferralReward(invitedCustomerId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { invitedCustomerId },
    });
    if (!referral || referral.rewardedAt) return;

    const rewardPoints = referral.rewardPoints || 100;
    const inviterLoyalty = await this.getOrCreate(referral.inviterCustomerId);
    const newPoints = inviterLoyalty.points + rewardPoints;
    await this.prisma.$transaction([
      this.prisma.customerLoyalty.update({
        where: { customerId: referral.inviterCustomerId },
        data: { points: newPoints, level: this.levelForPoints(newPoints) },
      }),
      this.prisma.referral.update({
        where: { id: referral.id },
        data: { rewardedAt: new Date(), rewardPoints },
      }),
    ]);
  }

  async onOrderDelivered(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { guestOrder: true },
    });
    if (!order || order.status !== 'DELIVERED') return;

    const customerId = order.guestOrder.customerId;
    if (!customerId) return;

    await this.awardOrderPoints(customerId, Number(order.total));

    const priorDelivered = await this.prisma.order.count({
      where: {
        id: { not: orderId },
        deletedAt: null,
        status: 'DELIVERED',
        guestOrder: { customerId },
      },
    });
    if (priorDelivered === 0) {
      await this.processReferralReward(customerId);
    }
  }
}
