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

  async assertRestaurantOpen(businessId: string) {
    const open = await this.isOpen(businessId);
    if (!open) {
      throw new Error('Business is currently closed');
    }
  }

  async isOpen(businessId: string) {
    const [hours, holidays] = await Promise.all([
      this.prisma.businessWorkingHours.findMany({ where: { businessId } }),
      this.prisma.businessHoliday.findMany({
        where: {
          businessId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);
    return isRestaurantOpenNow(hours, holidays);
  }

  getWorkingHours(businessId: string) {
    return this.prisma.businessWorkingHours.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async setWorkingHours(businessId: string, hours: WorkingHourInput[]) {
    await this.prisma.businessWorkingHours.deleteMany({ where: { businessId } });
    if (hours.length) {
      await this.prisma.businessWorkingHours.createMany({
        data: hours.map((h) => ({
          businessId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed ?? false,
        })),
      });
    }
    return this.getWorkingHours(businessId);
  }

  getHolidays(businessId: string) {
    return this.prisma.businessHoliday.findMany({
      where: { businessId },
      orderBy: { date: 'asc' },
    });
  }

  async addHoliday(businessId: string, date: string, reason?: string) {
    return this.prisma.businessHoliday.create({
      data: {
        businessId,
        date: new Date(date),
        reason,
      },
    });
  }

  async removeHoliday(businessId: string, holidayId: string) {
    const row = await this.prisma.businessHoliday.findFirst({
      where: { id: holidayId, businessId },
    });
    if (!row) throw new NotFoundException('Holiday not found');
    return this.prisma.businessHoliday.delete({ where: { id: holidayId } });
  }
}
