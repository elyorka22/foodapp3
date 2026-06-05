import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdminSettingsDto } from './dto/admin-settings.dto';
import {
  DEFAULT_IMAGE_FRAMING,
  type ImageFramingDefaults,
  pickImageFramingDefaults,
} from '../../common/utils/image-framing.util';

export interface DeliveryPricing {
  baseFee: number;
  pricePerKm: number;
  minDeliveryFee: number;
  /** Multiplier on straight-line km to approximate road distance (default 1.35). */
  roadDistanceFactor: number;
  courierPricePerKm: number;
  courierMinFee: number;
}

export interface AdminSettings extends ImageFramingDefaults {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  support_phone: string;
  support_telegram: string;
  support_email: string;
  min_order_amount: number;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  commission_default: number;
}

export interface PublicSettings {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  banner_default_image_scale: number;
  banner_default_image_position_x: number;
  banner_default_image_position_y: number;
  restaurant_card_default_image_scale: number;
  restaurant_card_default_cover_position_x: number;
  restaurant_card_default_cover_position_y: number;
}

const DEFAULT_PRICING: DeliveryPricing = {
  baseFee: 0,
  pricePerKm: 3000,
  minDeliveryFee: 0,
  roadDistanceFactor: 1.35,
  courierPricePerKm: 1500,
  courierMinFee: 5000,
};

const DEFAULT_ADMIN: AdminSettings = {
  ...DEFAULT_IMAGE_FRAMING,
  app_name: 'Food Delivery',
  home_title: 'CHUST',
  home_subtitle: "Shahar bo'ylab yetkazish",
  support_phone: '+998901234567',
  support_telegram: '@support',
  support_email: 'support@foodapp.local',
  min_order_amount: 30000,
  free_delivery_threshold: 100000,
  default_delivery_fee: 8000,
  commission_default: 10,
};

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

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

  async getPublicSettings(): Promise<PublicSettings> {
    const admin = await this.getAdminSettings();
    const framing = pickImageFramingDefaults(admin);
    return {
      app_name: admin.app_name,
      home_title: admin.home_title,
      home_subtitle: admin.home_subtitle,
      banner_default_image_scale: framing.banner_default_image_scale,
      banner_default_image_position_x: framing.banner_default_image_position_x,
      banner_default_image_position_y: framing.banner_default_image_position_y,
      restaurant_card_default_image_scale: framing.restaurant_card_default_image_scale,
      restaurant_card_default_cover_position_x:
        framing.restaurant_card_default_cover_position_x,
      restaurant_card_default_cover_position_y:
        framing.restaurant_card_default_cover_position_y,
    };
  }

  async getImageFramingDefaults(): Promise<ImageFramingDefaults> {
    const admin = await this.getAdminSettings();
    return pickImageFramingDefaults(admin);
  }

  async getAdminSettings(): Promise<AdminSettings> {
    const [adminSetting, pricing, commission] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: 'admin_settings' } }),
      this.getDeliveryPricing(),
      this.getCommissionDefault(),
    ]);

    const stored = (adminSetting?.value ?? {}) as Partial<AdminSettings>;
    return {
      ...DEFAULT_ADMIN,
      ...stored,
      default_delivery_fee: stored.default_delivery_fee ?? pricing.baseFee,
      commission_default: stored.commission_default ?? commission,
    };
  }

  async setAdminSettings(dto: AdminSettingsDto, userId?: string): Promise<AdminSettings> {
    const current = await this.getAdminSettings();
    const merged: AdminSettings = {
      ...current,
      ...dto,
    };

    await this.prisma.setting.upsert({
      where: { key: 'admin_settings' },
      create: { key: 'admin_settings', value: merged as object, group: 'general' },
      update: { value: merged as object },
    });

    if (dto.default_delivery_fee !== undefined) {
      const pricing = await this.getDeliveryPricing();
      await this.setDeliveryPricing({ ...pricing, baseFee: dto.default_delivery_fee });
    }

    if (dto.commission_default !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'default_commission' },
        create: {
          key: 'default_commission',
          value: { rate: dto.commission_default },
          group: 'payments',
        },
        update: { value: { rate: dto.commission_default } },
      });
    }

    await this.audit.log({
      userId,
      action: 'update',
      entity: 'settings',
      entityId: 'admin_settings',
      metadata: dto,
    });

    return this.getAdminSettings();
  }

  async getCommissionDefault(): Promise<number> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'default_commission' },
    });
    return (setting?.value as { rate?: number })?.rate ?? DEFAULT_ADMIN.commission_default;
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
