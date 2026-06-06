import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  support_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  support_telegram?: string;

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
