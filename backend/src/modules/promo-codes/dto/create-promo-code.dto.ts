import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromoCodeType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ enum: PromoCodeType })
  @IsEnum(PromoCodeType)
  type: PromoCodeType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maximumDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
