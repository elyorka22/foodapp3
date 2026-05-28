import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DeliveryPricing {
  baseFee: number;
  pricePerKm: number;
  minDeliveryFee: number;
  courierPricePerKm: number;
  courierMinFee: number;
}

const DEFAULT_PRICING: DeliveryPricing = {
  baseFee: 5000,
  pricePerKm: 2000,
  minDeliveryFee: 8000,
  courierPricePerKm: 1500,
  courierMinFee: 5000,
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getDeliveryPricing(): Promise<DeliveryPricing> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'delivery_pricing' },
    });
    if (!setting?.value) return DEFAULT_PRICING;
    return { ...DEFAULT_PRICING, ...(setting.value as object) } as DeliveryPricing;
  }

  async setDeliveryPricing(data: DeliveryPricing) {
    return this.prisma.setting.upsert({
      where: { key: 'delivery_pricing' },
      create: { key: 'delivery_pricing', value: data as object, group: 'delivery' },
      update: { value: data as object },
    });
  }

  async getCommissionDefault(): Promise<number> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'default_commission' },
    });
    return (setting?.value as { rate?: number })?.rate ?? 10;
  }

  async get(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async set(key: string, value: object, group = 'general') {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, group },
      update: { value },
    });
  }
}
