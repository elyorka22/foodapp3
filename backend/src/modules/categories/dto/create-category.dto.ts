import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    description: 'Preferred. Shared catalog for this business type UUID.',
  })
  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @ApiPropertyOptional({
    description: 'Business type slug (flowers, grocery, …). Alternative to businessTypeId.',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    deprecated: true,
    description: 'Legacy per-store scope. Prefer businessTypeId / type.',
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ deprecated: true, description: 'Legacy alias for businessId' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  imageScale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  imagePositionX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  imagePositionY?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
