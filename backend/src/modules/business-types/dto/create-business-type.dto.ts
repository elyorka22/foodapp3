import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateBusinessTypeDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    description:
      'Optional URL slug. Omit for auto-generation from name. Custom slug must be unique.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Image zoom 50–200%', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  imageScale?: number;

  @ApiPropertyOptional({ description: 'Focal point X 0–100', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  imagePositionX?: number;

  @ApiPropertyOptional({ description: 'Focal point Y 0–100', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  imagePositionY?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
