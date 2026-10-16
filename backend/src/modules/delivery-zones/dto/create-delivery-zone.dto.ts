import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryZoneDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ description: 'City-wide zone' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Circle center latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  centerLatitude?: number;

  @ApiPropertyOptional({ description: 'Circle center longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  centerLongitude?: number;

  @ApiPropertyOptional({ description: 'Circle radius in km' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radiusKm?: number;

  @ApiPropertyOptional({ description: 'GeoJSON Polygon / MultiPolygon or ring' })
  @IsOptional()
  @IsObject()
  polygon?: Record<string, unknown> | number[][];

  @ApiProperty({ default: 8000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  baseFee: number;

  @ApiProperty({ default: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerKm: number;

  @ApiProperty({ default: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minDeliveryFee: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
