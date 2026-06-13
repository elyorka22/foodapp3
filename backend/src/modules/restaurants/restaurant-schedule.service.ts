import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  resolveRestaurantAvailability,
  normalizeTimeTo24h,
  type RestaurantAvailability,
} from '../../common/utils/restaurant-hours.util';

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
    const availability = await this.getAvailability(businessId);
    return availability.isOpen;
  }

  async getAvailability(businessId: string): Promise<RestaurantAvailability> {
    const map = await this.getAvailabilityBatch([businessId]);
    return map.get(businessId) ?? {
      isOpen: true,
      closesAt: null,
      closingSoon: false,
      minutesUntilClose: null,
    };
  }

  async getAvailabilityBatch(businessIds: string[]): Promise<Map<string, RestaurantAvailability>> {
    const result = new Map<string, RestaurantAvailability>();
    if (!businessIds.length) return result;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [allHours, allHolidays] = await Promise.all([
      this.prisma.businessWorkingHours.findMany({
        where: { businessId: { in: businessIds } },
      }),
      this.prisma.businessHoliday.findMany({
        where: {
          businessId: { in: businessIds },
          date: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

    const hoursByBusiness = new Map<string, typeof allHours>();
    for (const row of allHours) {
      const list = hoursByBusiness.get(row.businessId) ?? [];
      list.push(row);
      hoursByBusiness.set(row.businessId, list);
    }

    const holidaysByBusiness = new Map<string, typeof allHolidays>();
    for (const row of allHolidays) {
      const list = holidaysByBusiness.get(row.businessId) ?? [];
      list.push(row);
      holidaysByBusiness.set(row.businessId, list);
    }

    for (const id of businessIds) {
      result.set(
        id,
        resolveRestaurantAvailability(
          hoursByBusiness.get(id) ?? [],
          holidaysByBusiness.get(id) ?? [],
        ),
      );
    }

    return result;
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
      const data = hours.map((h) => {
        const openTime = normalizeTimeTo24h(h.openTime);
        const closeTime = normalizeTimeTo24h(h.closeTime);
        if (!openTime) {
          throw new BadRequestException(`Invalid open time: ${h.openTime}`);
        }
        if (!closeTime) {
          throw new BadRequestException(`Invalid close time: ${h.closeTime}`);
        }
        return {
          businessId,
          dayOfWeek: h.dayOfWeek,
          openTime,
          closeTime,
          isClosed: h.isClosed ?? false,
        };
      });
      await this.prisma.businessWorkingHours.createMany({ data });
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
