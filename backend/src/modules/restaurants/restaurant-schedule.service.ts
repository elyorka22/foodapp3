import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isRestaurantOpenNow } from '../../common/utils/restaurant-hours.util';

export type WorkingHourInput = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
};

@Injectable()
export class RestaurantScheduleService {
  constructor(private prisma: PrismaService) {}

  async assertRestaurantOpen(restaurantId: string) {
    const open = await this.isOpen(restaurantId);
    if (!open) {
      throw new Error('Restaurant is currently closed');
    }
  }

  async isOpen(restaurantId: string) {
    const [hours, holidays] = await Promise.all([
      this.prisma.restaurantWorkingHours.findMany({ where: { restaurantId } }),
      this.prisma.restaurantHoliday.findMany({
        where: {
          restaurantId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);
    return isRestaurantOpenNow(hours, holidays);
  }

  getWorkingHours(restaurantId: string) {
    return this.prisma.restaurantWorkingHours.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async setWorkingHours(restaurantId: string, hours: WorkingHourInput[]) {
    await this.prisma.restaurantWorkingHours.deleteMany({ where: { restaurantId } });
    if (hours.length) {
      await this.prisma.restaurantWorkingHours.createMany({
        data: hours.map((h) => ({
          restaurantId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        })),
      });
    }
    return this.getWorkingHours(restaurantId);
  }

  getHolidays(restaurantId: string) {
    return this.prisma.restaurantHoliday.findMany({
      where: { restaurantId },
      orderBy: { date: 'asc' },
    });
  }

  async addHoliday(restaurantId: string, date: string, reason?: string) {
    return this.prisma.restaurantHoliday.create({
      data: {
        restaurantId,
        date: new Date(date),
        reason,
      },
    });
  }

  async removeHoliday(restaurantId: string, holidayId: string) {
    const row = await this.prisma.restaurantHoliday.findFirst({
      where: { id: holidayId, restaurantId },
    });
    if (!row) throw new NotFoundException('Holiday not found');
    return this.prisma.restaurantHoliday.delete({ where: { id: holidayId } });
  }
}
