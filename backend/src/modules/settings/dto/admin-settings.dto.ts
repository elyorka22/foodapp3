import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  @IsOptional()
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
}
