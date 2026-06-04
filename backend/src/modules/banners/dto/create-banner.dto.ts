import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerPlacement } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateBannerDto {
  @ApiPropertyOptional({ description: 'Optional headline; leave empty for image-only banners' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ enum: BannerPlacement, default: BannerPlacement.HERO })
  @IsOptional()
  @IsEnum(BannerPlacement)
  placement?: BannerPlacement;

  @ApiPropertyOptional({ description: 'Optional subtitle for promo banners' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Zoom 50–200; omit to use global default' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  imageScale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  imagePositionX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  imagePositionY?: number;
}
