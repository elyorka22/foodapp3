import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { WorkingHourDto } from './set-working-hours.dto';

export class CreateRestaurantDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description:
      'Optional URL slug. Omit or match auto slug from name for unique auto-generation (pizza-house-2, …). Custom slug must be unique.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Marketplace category (business type) UUID' })
  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cover focal point X (0=left, 100=right)', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  coverPositionX?: number;

  @ApiPropertyOptional({ description: 'Cover focal point Y (0=top, 100=bottom)', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  coverPositionY?: number;

  @ApiPropertyOptional({ description: 'Cover zoom 50–200 for homepage card' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  coverScale?: number;

  @ApiPropertyOptional({ description: 'Primary branch address for delivery distance' })
  @IsOptional()
  @IsString()
  branchAddress?: string;

  @ApiPropertyOptional({ example: 41.002, description: 'Restaurant latitude (delivery origin)' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 71.24, description: 'Restaurant longitude (delivery origin)' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ enum: ['RESTAURANT', 'STORE'] })
  @IsOptional()
  @IsIn(['RESTAURANT', 'STORE'])
  kind?: 'RESTAURANT' | 'STORE';

  @ApiPropertyOptional({ description: 'Owner login — email or phone for business panel' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  ownerLogin?: string;

  @ApiPropertyOptional({ description: 'Owner password for business panel login' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  ownerPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerFullName?: string;

  @ApiPropertyOptional({ type: [WorkingHourDto], description: 'Weekly schedule; empty = always open' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours?: WorkingHourDto[];
}
