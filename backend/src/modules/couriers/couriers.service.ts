import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouriersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.courier.findMany({
      where: { deletedAt: null },
      include: { user: { select: { fullName: true, phone: true, email: true } } },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.courier.findFirst({
      where: { userId },
      include: {
        user: { select: { fullName: true, phone: true } },
        assignments: {
          take: 20,
          orderBy: { assignedAt: 'desc' },
          include: { order: { select: { orderNumber: true, status: true, total: true } } },
        },
      },
    });
  }

  async setOnline(userId: string, isOnline: boolean) {
    return this.prisma.courier.updateMany({
      where: { userId },
      data: { isOnline },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.courier.updateMany({
      where: { userId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async getAvailableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PREPARING, OrderStatus.COURIER_ASSIGNED] },
        courierId: null,
        deletedAt: null,
      },
      include: {
        guestOrder: true,
        restaurant: { select: { name: true } },
        branch: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  async getEarnings(userId: string) {
    const courier = await this.prisma.courier.findFirst({ where: { userId } });
    if (!courier) return null;

    const assignments = await this.prisma.courierAssignment.aggregate({
      where: { courierId: courier.id },
      _sum: { courierFee: true },
      _count: true,
    });

    return {
      totalEarnings: Number(courier.totalEarnings),
      assignmentEarnings: Number(assignments._sum.courierFee ?? 0),
      totalDeliveries: courier.totalDeliveries,
      completedAssignments: assignments._count,
    };
  }
}
