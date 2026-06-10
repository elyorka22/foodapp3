import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdminSettingsDto } from './dto/admin-settings.dto';
import {
  DEFAULT_IMAGE_FRAMING,
  type ImageFramingDefaults,
  pickImageFramingDefaults,
} from '../../common/utils/image-framing.util';
import {
  normalizeTelegramUrl,
  telegramDisplayLabel,
} from '../../common/utils/telegram-url.util';

export interface DeliveryPricing {
  baseDeliveryFee: number;
  perKmFee: number;
  maxDeliveryDistance: number;
  courierPricePerKm: number;
  courierMinFee: number;
  /** @deprecated legacy keys — normalized on read */
  baseFee?: number;
  pricePerKm?: number;
  minDeliveryFee?: number;
  roadDistanceFactor?: number;
}

export interface AdminSettings extends ImageFramingDefaults {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  home_restaurants_banner_image_url: string;
  home_restaurants_banner_title: string;
  support_phone: string;
  support_telegram: string;
  help_telegram_url: string;
  partnership_telegram_url: string;
  partnership_phone: string;
  social_instagram_url: string;
  social_telegram_url: string;
  social_youtube_url: string;
  support_email: string;
  min_order_amount: number;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  commission_default: number;
  courier_dispatch_mode: 'auto' | 'manager';
}

export interface PublicSettings {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  home_restaurants_banner_image_url: string;
  home_restaurants_banner_title: string;
  banner_default_image_scale: number;
  banner_default_image_position_x: number;
  banner_default_image_position_y: number;
  restaurant_card_default_image_scale: number;
  restaurant_card_default_cover_position_x: number;
  restaurant_card_default_cover_position_y: number;
  social_instagram_url: string;
  social_telegram_url: string;
  social_youtube_url: string;
  help_telegram_url: string;
  help_telegram_label: string;
  partnership_telegram_url: string;
  partnership_telegram_label: string;
  partnership_phone: string;
}

const DEFAULT_PRICING: DeliveryPricing = {
  baseDeliveryFee: 8000,
  perKmFee: 1500,
  maxDeliveryDistance: 10,
  courierPricePerKm: 1500,
  courierMinFee: 5000,
};

const DEFAULT_ADMIN: AdminSettings = {
  ...DEFAULT_IMAGE_FRAMING,
  app_name: 'Food Delivery',
  home_title: 'CHUST',
  home_subtitle: "Shahar bo'ylab yetkazish",
  home_restaurants_banner_image_url: '',
  home_restaurants_banner_title: 'Barcha restoranlar',
  support_phone: '+998901234567',
  support_telegram: '@support',
  help_telegram_url: '',
  partnership_telegram_url: '',
  partnership_phone: '',
  social_instagram_url: '',
  social_telegram_url: '',
  social_youtube_url: '',
  support_email: 'support@foodapp.local',
  min_order_amount: 30000,
  free_delivery_threshold: 100000,
  default_delivery_fee: 8000,
  commission_default: 10,
  courier_dispatch_mode: 'manager',
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
    const stored = setting.value as Partial<DeliveryPricing>;
    return {
      ...DEFAULT_PRICING,
      ...stored,
      baseDeliveryFee:
        stored.baseDeliveryFee ?? stored.baseFee ?? DEFAULT_PRICING.baseDeliveryFee,
      perKmFee: stored.perKmFee ?? stored.pricePerKm ?? DEFAULT_PRICING.perKmFee,
      maxDeliveryDistance:
        stored.maxDeliveryDistance ?? DEFAULT_PRICING.maxDeliveryDistance,
    };
  }

  async setDeliveryPricing(data: DeliveryPricing) {
    await this.prisma.setting.upsert({
      where: { key: 'delivery_pricing' },
      create: { key: 'delivery_pricing', value: data as object, group: 'delivery' },
      update: { value: data as object },
    });
    return this.getDeliveryPricing();
  }

  async getPublicSettings(): Promise<PublicSettings> {
    const admin = await this.getAdminSettings();
    const framing = pickImageFramingDefaults(admin);
    return {
      app_name: admin.app_name,
      home_title: admin.home_title,
      home_subtitle: admin.home_subtitle,
      home_restaurants_banner_image_url: admin.home_restaurants_banner_image_url ?? '',
      home_restaurants_banner_title:
        admin.home_restaurants_banner_title?.trim() || 'Barcha restoranlar',
      banner_default_image_scale: framing.banner_default_image_scale,
      banner_default_image_position_x: framing.banner_default_image_position_x,
      banner_default_image_position_y: framing.banner_default_image_position_y,
      restaurant_card_default_image_scale: framing.restaurant_card_default_image_scale,
      restaurant_card_default_cover_position_x:
        framing.restaurant_card_default_cover_position_x,
      restaurant_card_default_cover_position_y:
        framing.restaurant_card_default_cover_position_y,
      social_instagram_url: admin.social_instagram_url ?? '',
      social_telegram_url: admin.social_telegram_url ?? '',
      social_youtube_url: admin.social_youtube_url ?? '',
      help_telegram_url: this.resolveHelpTelegramUrl(admin),
      help_telegram_label: telegramDisplayLabel(
        admin.help_telegram_url?.trim() || admin.support_telegram,
      ),
      partnership_telegram_url: normalizeTelegramUrl(admin.partnership_telegram_url),
      partnership_telegram_label: telegramDisplayLabel(admin.partnership_telegram_url),
      partnership_phone: admin.partnership_phone?.trim() ?? '',
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
      default_delivery_fee: stored.default_delivery_fee ?? pricing.baseDeliveryFee,
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
      await this.setDeliveryPricing({
        ...pricing,
        baseDeliveryFee: dto.default_delivery_fee,
      });
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

  private resolveHelpTelegramUrl(admin: AdminSettings): string {
    const raw = admin.help_telegram_url?.trim() || admin.support_telegram?.trim();
    return normalizeTelegramUrl(raw);
  }

  async getCourierDispatchMode(): Promise<'auto' | 'manager'> {
    const admin = await this.getAdminSettings();
    return admin.courier_dispatch_mode === 'auto' ? 'auto' : 'manager';
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
