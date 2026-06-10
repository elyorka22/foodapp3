import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export const COURIER_DISPATCH_MODES = ['auto', 'manager'] as const;
export type CourierDispatchMode = (typeof COURIER_DISPATCH_MODES)[number];

export class AdminSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  app_name?: string;

  @ApiPropertyOptional({ description: 'Homepage headline above banners' })
  @IsOptional()
  @IsString()
  home_title?: string;

  @ApiPropertyOptional({ description: 'Optional subtitle under homepage headline' })
  @IsOptional()
  @IsString()
  home_subtitle?: string;

  @ApiPropertyOptional({ description: 'Home secondary banner image — all restaurants tile' })
  @IsOptional()
  @IsString()
  home_restaurants_banner_image_url?: string;

  @ApiPropertyOptional({ description: 'Label on all-restaurants home banner' })
  @IsOptional()
  @IsString()
  home_restaurants_banner_title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  support_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  support_telegram?: string;

  @ApiPropertyOptional({ description: 'Help page Telegram link (@user or https://t.me/...)' })
  @IsOptional()
  @IsString()
  help_telegram_url?: string;

  @ApiPropertyOptional({ description: 'Partnership page Telegram link' })
  @IsOptional()
  @IsString()
  partnership_telegram_url?: string;

  @ApiPropertyOptional({ description: 'Partnership page phone number' })
  @IsOptional()
  @IsString()
  partnership_phone?: string;

  @ApiPropertyOptional({ description: 'Instagram profile URL for customer app profile' })
  @IsOptional()
  @IsString()
  social_instagram_url?: string;

  @ApiPropertyOptional({ description: 'Telegram channel/group URL for customer app profile' })
  @IsOptional()
  @IsString()
  social_telegram_url?: string;

  @ApiPropertyOptional({ description: 'YouTube channel URL for customer app profile' })
  @IsOptional()
  @IsString()
  social_youtube_url?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: AdminSettingsDto) => o.support_email != null && String(o.support_email).trim() !== '')
  @IsEmail()
  support_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  free_delivery_threshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  default_delivery_fee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  commission_default?: number;

  @ApiPropertyOptional({
    description: 'auto = pool orders for couriers after restaurant calls courier; manager = manual assignment',
    enum: COURIER_DISPATCH_MODES,
  })
  @IsOptional()
  @IsIn(COURIER_DISPATCH_MODES)
  courier_dispatch_mode?: CourierDispatchMode;

  @ApiPropertyOptional({ description: 'Default banner zoom % (50–200)' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  banner_default_image_scale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  banner_default_image_position_x?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  banner_default_image_position_y?: number;

  @ApiPropertyOptional({ description: 'Default restaurant card zoom % (50–200)' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  restaurant_card_default_image_scale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  restaurant_card_default_cover_position_x?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  restaurant_card_default_cover_position_y?: number;
}
