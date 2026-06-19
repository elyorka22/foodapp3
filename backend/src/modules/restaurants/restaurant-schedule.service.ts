import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeNonWorkingPeriodTimes, normalizeTimeTo24h } from '../../common/utils/time-format.util';
import {
  resolveRestaurantAvailability,
  getAppTimezone,
  getLocalDateKey,
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

    const todayKey = getLocalDateKey(new Date(), getAppTimezone());

    const [allHours, allHolidays] = await Promise.all([
      this.prisma.businessWorkingHours.findMany({
        where: { businessId: { in: businessIds } },
      }),
      this.prisma.businessHoliday.findMany({
        where: { businessId: { in: businessIds } },
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
      if (getLocalDateKey(row.date, getAppTimezone()) !== todayKey) continue;
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
        const normalized = normalizeNonWorkingPeriodTimes(h.closeTime, h.openTime);
        const openTime = normalizeTimeTo24h(normalized.openTime);
        const closeTime = normalizeTimeTo24h(normalized.closeTime);
        if (!openTime) {
          throw new BadRequestException(`Invalid resume time: ${h.openTime}`);
        }
        if (!closeTime) {
          throw new BadRequestException(`Invalid closed-from time: ${h.closeTime}`);
        }
        if (openTime === closeTime && !(h.isClosed ?? false)) {
          throw new BadRequestException(
            'Non-working period start and end must differ (e.g. closed 1:00 AM – 8:00 AM)',
          );
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
